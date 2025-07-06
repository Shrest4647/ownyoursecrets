import "react-native-get-random-values";

import { Encrypter, Decrypter } from "age-encryption";
import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils.js";

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  if (type === "encrypt") {
    const { plaintext, ageSecretKey } = payload;
    try {
      const ageEncrypt = new Encrypter();
      ageEncrypt.setPassphrase(ageSecretKey);
      ageEncrypt.setScryptWorkFactor(12);
      const encrypted = await ageEncrypt.encrypt(plaintext);
      const utf8String = bytesToHex(encrypted);
      self.postMessage({
        status: "success",
        type: "encrypt",
        result: utf8String,
      });
    } catch (error) {
      console.error("Encryption failed in worker:", error);
      self.postMessage({
        status: "error",
        type: "encrypt",
        message: "Failed to encrypt data.",
      });
    }
  } else if (type === "decrypt") {
    const { encryptedText, ageSecretKey } = payload;
    try {
      const encryptedData = hexToBytes(encryptedText);
      const ageDecrypt = new Decrypter();
      ageDecrypt.addPassphrase(ageSecretKey);
      const decrypted = await ageDecrypt.decrypt(encryptedData, "text");
      self.postMessage({
        status: "success",
        type: "decrypt",
        result: decrypted,
      });
    } catch (error) {
      console.error("Decryption failed in worker:", error);
      self.postMessage({
        status: "error",
        type: "decrypt",
        message: "Failed to decrypt data.",
      });
    }
  }
};
