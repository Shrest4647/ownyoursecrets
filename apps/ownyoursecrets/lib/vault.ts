import { encrypt as encryptSecret, decrypt as decryptSecret } from "./crypto";
import { VAULT_DIR } from "@/store/constants";

import * as FileSystem from "expo-file-system";

export interface StoredSecret {
  encryptedData: string;
  decryptedData?: string; // Optional, for internal use
  name?: string; // Add name field
  metadata: string; // Now a string
  createdAt: string;
  updatedAt: string;
}

export const getVaultPath = async (): Promise<string> => {
  const vaultPath = FileSystem.documentDirectory + VAULT_DIR;
  const dirInfo = await FileSystem.getInfoAsync(vaultPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(vaultPath, { intermediates: true });
  }
  console.log(`Vault path is: ${vaultPath}`);
  return vaultPath;
};

export const validateSecretName = (name: string): boolean => {
  // Alphanumeric, dash, underscore, and slash are allowed
  return /^[a-zA-Z0-9/_-]+$/.test(name);
};

const getSecretFilePath = async (secretName: string): Promise<string> => {
  if (!validateSecretName(secretName)) {
    throw new Error(
      "Invalid secret name. Only alphanumeric, dash, underscore, and slash are allowed."
    );
  }

  const vaultPath = await getVaultPath();
  const fullPath = `${vaultPath}/${secretName}.json`;

  // Ensure intermediate directories exist if secretName contains slashes
  const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));
  const dirInfo = await FileSystem.getInfoAsync(dirPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
  }

  return fullPath;
};

export const saveSecret = async (
  secretName: string,
  secretData: string,
  metadata: string,
  ageSecretKey: string
): Promise<void> => {
  try {
    console.log(`Saving secret '${secretName}' with metadata:`, secretData);
    const encryptedData = await encryptSecret(secretData, ageSecretKey);
    const now = new Date().toISOString();

    const storedSecret: StoredSecret = {
      encryptedData,
      name: secretName,
      metadata: metadata,
      createdAt: now,
      updatedAt: now,
    };

    const filePath = await getSecretFilePath(secretName);

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(storedSecret, null, 2)
    );
    console.log(`Secret '${secretName}' saved successfully to ${filePath}`);
  } catch (error) {
    console.error(`Failed to save secret '${secretName}':`, error);
    throw error;
  }
};

export const getSecret = async (
  secretName: string,
  ageSecretKey: string
): Promise<{ secretData: string; storedSecret: StoredSecret } | null> => {
  try {
    const filePath = await getSecretFilePath(secretName);

    const fileContent = await FileSystem.readAsStringAsync(filePath);
    const storedSecret: StoredSecret = JSON.parse(fileContent);

    const decryptedData = await decryptSecret(
      storedSecret.encryptedData,
      ageSecretKey
    );
    const secretData = decryptedData;

    return { secretData, storedSecret };
  } catch (error) {
    console.error(`Failed to retrieve secret '${secretName}':`, error);
    return null;
  }
};

export const listSecrets = async (): Promise<StoredSecret[]> => {
  try {
    const vaultPath = await getVaultPath();
    const allFiles: string[] = [];

    const readDirectoryRecursive = async (directory: string) => {
      const files = await FileSystem.readDirectoryAsync(directory);
      const validFiles = files.filter(
        (file) => file && !file.startsWith(".") && !file.startsWith("file:")
      );

      for (const file of validFiles) {
        const filePath = `${directory}/${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.isDirectory) {
          await readDirectoryRecursive(filePath);
        } else if (fileInfo.uri.endsWith(".json")) {
          allFiles.push(filePath);
        }
      }
    };

    await readDirectoryRecursive(vaultPath);

    const secrets: StoredSecret[] = [];
    for (const filePath of allFiles) {
      try {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        const storedSecret: StoredSecret = JSON.parse(fileContent);
        storedSecret.name = filePath.substring(
          filePath.lastIndexOf(VAULT_DIR + "/") + VAULT_DIR.length + 1,
          filePath.lastIndexOf(".json")
        );
        secrets.push(storedSecret);
      } catch (parseError) {
        console.warn(`Failed to parse secret file ${filePath}:`, parseError);
      }
    }
    return secrets;
  } catch (error) {
    console.error("Failed to list secrets:", error);
    return [];
  }
};

export const exportVault = async (): Promise<Record<string, any>> => {
  try {
    const allStoredSecrets = await listSecrets();
    const exportedData: Record<string, any> = {};

    for (const storedSecret of allStoredSecrets) {
      try {
        const secretName = storedSecret.name!;

        exportedData[secretName] = storedSecret;
      } catch (decryptError) {
        console.warn(
          `Failed to decrypt or parse secret for export:`,
          decryptError
        );
      }
    }
    return exportedData;
  } catch (error) {
    console.error("Failed to export vault:", error);
    return {};
  }
};

export const exportDecryptedVault = async (
  ageSecretKey: string
): Promise<Record<string, any>> => {
  try {
    const allStoredSecrets = await listSecrets();
    const exportedData: Record<string, any> = {};

    for (const storedSecret of allStoredSecrets) {
      try {
        let decryptedData = await decryptSecret(
          storedSecret.encryptedData,
          ageSecretKey
        );

        // Extract secret name from metadata or derive from file path if needed
        // For now, assuming metadata string is the secret name or can be used to derive it.
        // If metadata is just a string, we might need to adjust how the key is formed.
        // Let's assume the metadata string is the secret name for now.
        const secretName = storedSecret.metadata; // Assuming metadata is the secret name

        exportedData[secretName] = {
          encryptedData: storedSecret.encryptedData,
          decryptedData,
          metadata: storedSecret.metadata,
          createdAt: storedSecret.createdAt,
          updatedAt: storedSecret.updatedAt,
        };
      } catch (decryptError) {
        console.warn(
          `Failed to decrypt or parse secret for export:`,
          decryptError
        );
      }
    }
    return exportedData;
  } catch (error) {
    console.error("Failed to export vault:", error);
    return {};
  }
};

export const importVault = async (
  importedData: Record<string, any>,
  ageSecretKey: string
): Promise<void> => {
  try {
    Object.entries(importedData).forEach(async ([secretName, storedSecret]) => {
      const jsonData = JSON.parse(storedSecret);
      const existingSecret = await getSecret(secretName, ageSecretKey);
      if (existingSecret) {
        if (
          jsonData.updatedAt &&
          new Date(jsonData.updatedAt) >
            new Date(existingSecret.storedSecret.updatedAt)
        ) {
          const decryptedData = await decryptSecret(
            existingSecret.storedSecret.encryptedData,
            ageSecretKey
          );
          await editSecret(
            secretName,
            decryptedData,
            jsonData.metadata,
            ageSecretKey
          );
        }
      } else {
        const decryptedData = await decryptSecret(
          jsonData.encryptedData,
          ageSecretKey
        );
        await saveSecret(
          secretName,
          decryptedData,
          jsonData.metadata,
          ageSecretKey
        );
      }
    });
    console.log("Vault imported successfully!");
  } catch (error) {
    console.error("Failed to import vault:", error);
    throw error;
  }
};

export const editSecret = async (
  secretName: string,
  newSecretData: string,
  newMetadata: string,
  ageSecretKey: string
): Promise<void> => {
  try {
    // First, get the existing secret to preserve createdAt timestamp
    const existingSecret = await getSecret(secretName, ageSecretKey);
    if (!existingSecret) {
      throw new Error(`Secret '${secretName}' not found.`);
    }

    const encryptedData = await encryptSecret(newSecretData, ageSecretKey);
    const now = new Date().toISOString();

    const updatedStoredSecret: StoredSecret = {
      encryptedData,
      metadata: newMetadata,
      createdAt: existingSecret.storedSecret.createdAt, // Preserve original creation date
      updatedAt: now,
    };

    const filePath = await getSecretFilePath(secretName);

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(updatedStoredSecret, null, 2)
    );
    console.log(`Secret '${secretName}' updated successfully to ${filePath}`);
  } catch (error) {
    console.error(`Failed to update secret '${secretName}':`, error);
    throw error;
  }
};

export const deleteSecret = async (secretName: string): Promise<void> => {
  try {
    const filePath = await getSecretFilePath(secretName);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      console.log(`Secret '${secretName}' deleted successfully.`);
    } else {
      console.warn(`Secret '${secretName}' not found at ${filePath}.`);
    }
  } catch (error) {
    console.error(`Failed to delete secret '${secretName}':`, error);
    throw error;
  }
};
