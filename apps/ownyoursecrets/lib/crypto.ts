import { Encrypter, Decrypter } from "age-encryption";
import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils.js";

// bytesToHex, bytesToUtf8
export async function encrypt(
  plaintext: string,
  ageSecretKey: string
): Promise<string> {
  try {
    const ageEncrypt = new Encrypter();
    ageEncrypt.setPassphrase(ageSecretKey);
    ageEncrypt.setScryptWorkFactor(12);
    const encrypted = await ageEncrypt.encrypt(plaintext);
    const utf8String = bytesToHex(encrypted);

    return utf8String;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data.");
  }
}

export async function decrypt(
  encryptedText: string,
  ageSecretKey: string
): Promise<string> {
  try {
    const encryptedData = hexToBytes(encryptedText);

    const ageDecrypt = new Decrypter();
    ageDecrypt.addPassphrase(ageSecretKey);

    const decrypted = await ageDecrypt.decrypt(encryptedData, "text");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data.");
  }
}
