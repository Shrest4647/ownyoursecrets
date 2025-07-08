import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/button";
import { decrypt, encrypt } from "@/lib/crypto";

export default function CryptoPlayground() {
  const [secret, setSecret] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");

  const handleEncrypt = async () => {
    try {
      const result = await encrypt(secret, publicKey);
      setEncrypted(result);
      handleDecrypt();
    } catch (e) {
      console.error("Error encrypting secret:", e);
      setEncrypted(`Error: ${e}`);
    }
  };

  const handleDecrypt = async () => {
    try {
      const result = await decrypt(encrypted, privateKey);
      setDecrypted(result);
    } catch (e) {
      setDecrypted(`Error: ${e}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Crypto Playground</Text>

      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder='Secret to encrypt'
        value={secret}
        onChangeText={setSecret}
      />
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder='AGE Public Key'
        value={publicKey}
        onChangeText={(t) => {
          setPublicKey(t);
        }}
      />
      <Button onPress={handleEncrypt}>
        <Text>Encrypt</Text>
      </Button>
      <Text style={{ marginTop: 10 }}>Encrypted:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginTop: 5, marginBottom: 10 }}
        value={encrypted}
        editable={false}
        multiline
      />

      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder='AGE Private Key'
        value={privateKey}
        onChangeText={(t) => {
          setPrivateKey(t);
        }}
      />
      <Button onPress={handleDecrypt}>
        <Text>Decrypt</Text>
      </Button>
      <Text style={{ marginTop: 10 }}>Decrypted:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginTop: 5 }}
        value={decrypted}
        editable={false}
        multiline
      />
    </View>
  );
}
