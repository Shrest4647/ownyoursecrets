import "react-native-get-random-values";
import { createWorkletRuntime } from "react-native-reanimated";
import { Encrypter, Decrypter, identityToRecipient } from "age-encryption";
import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils.js";
export { generateIdentity } from "age-encryption";

export const runtime = createWorkletRuntime("crypto");

export function generatePassword(length: number = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:?><.=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

export async function encrypt(
  plaintext: string,
  ageSecretKey: string
): Promise<string> {
  "worklet";

  try {
    const ageEncrypt = new Encrypter();
    ageEncrypt.addRecipient(await identityToRecipient(ageSecretKey));
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
  "worklet";

  try {
    const encryptedData = hexToBytes(encryptedText);
    const ageDecrypt = new Decrypter();
    ageDecrypt.addIdentity(ageSecretKey);

    const decrypted = await ageDecrypt.decrypt(encryptedData, "text");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data.");
  }
}

// export async function encrypt(
//   plaintext: string,
//   ageSecretKey: string
// ): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const worker = new Worker("../lib/cryptoWorker.ts");

//     worker.onmessage = (event) => {
//       const { status, type, result, message } = event.data;
//       if (status === "success" && type === "encrypt") {
//         resolve(result);
//       } else {
//         reject(new Error(message || "Encryption failed in worker."));
//       }
//       worker.terminate();
//     };

//     worker.onerror = (error) => {
//       console.error("Worker error:", error);
//       reject(new Error("Worker error during encryption."));
//       worker.terminate();
//     };

//     worker.postMessage({
//       type: "encrypt",
//       payload: { plaintext, ageSecretKey },
//     });
//   });
// }

// export async function decrypt(
//   encryptedText: string,
//   ageSecretKey: string
// ): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const worker = new Worker("../lib/cryptoWorker.ts");

//     worker.onmessage = (event) => {
//       const { status, type, result, message } = event.data;
//       if (status === "success" && type === "decrypt") {
//         resolve(result);
//       } else {
//         reject(new Error(message || "Decryption failed in worker."));
//       }
//       worker.terminate();
//     };

//     worker.onerror = (error) => {
//       console.error("Worker error:", error);
//       reject(new Error("Worker error during decryption."));
//       worker.terminate();
//     };

//     worker.postMessage({
//       type: "decrypt",
//       payload: { encryptedText, ageSecretKey },
//     });
//   });
// }
