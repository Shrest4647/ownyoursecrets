import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { View, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { exportVault, importVault } from "@/lib/vault";
import { useAuth } from "@/store/auth-context";
import Upload from "@/lib/icons/Upload";
import Download from "@/lib/icons/Download";
import { DownloadIcon, UploadIcon } from "lucide-react-native";

export default function SyncPassPage() {
  const [syncStatus, setSyncStatus] = useState("Idle");
  const [currentSyncOption, setCurrentSyncOption] = useState("None"); // e.g., "Git", "Drive", "None"
  const { ageSecretKey } = useAuth()!;

  const handleSync = () => {
    setSyncStatus("Syncing...");
    // TODO: Integrate Git operations (pull, push) using native bridge/package
    setTimeout(() => {
      setSyncStatus("Last Synced: " + new Date().toLocaleTimeString());
    }, 2000);
  };

  const handleExport = async () => {
    try {
      const exportedData = await exportVault();
      const fileName = `ownyoursecrets_backup_${Date.now()}.json`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportedData, null, 2)
      );
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on your device.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Error", "Failed to export vault.");
    }
  };

  const handleImport = async () => {
    console.log("handleImport");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain"], // Allow JSON and plain text files
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const importedData = JSON.parse(fileContent);
        await importVault(importedData, ageSecretKey);
        Alert.alert("Success", "Vault imported successfully!");
      } else if (result.canceled) {
        Alert.alert("Import Cancelled", "No file was selected for import.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert(
        "Error",
        "Failed to import vault. Make sure the file is a valid JSON backup."
      );
    }
  };

  return (
    <View className='flex-1 p-5 bg-background'>
      <Text className='text-2xl font-bold mb-5 text-foreground'>
        Sync & Backup
      </Text>

      <View className='mb-8 p-4 border border-border rounded-lg'>
        <Text className='text-lg font-semibold mb-2 text-foreground'>
          Sync Status
        </Text>
        <Text className='text-muted-foreground mb-2'>
          Current Sync Option: {currentSyncOption}
        </Text>
        <Text className='text-muted-foreground mb-4'>{syncStatus}</Text>
        {currentSyncOption !== "None" ? (
          <Button
            onPress={handleSync}
            className='rounded-full bg-primary-500 active:bg-primary-600'
          >
            <Text className='text-white'>Trigger Sync</Text>
          </Button>
        ) : (
          <Button
            onPress={() =>
              Alert.alert("Add Sync", "Navigate to sync setup page.")
            }
            className='rounded-full bg-secondary-500 active:bg-secondary-600'
          >
            <Text className='text-white'>Add Sync Features</Text>
          </Button>
        )}
      </View>

      <View className='mb-8 p-4 border border-border rounded-lg'>
        <Text className='text-lg font-semibold mb-2 text-foreground'>
          Backup & Restore
        </Text>
        <Button
          onPress={handleExport}
          className='rounded-full mb-3 bg-blue-500 active:bg-blue-600 flex-row gap-4'
        >
          <DownloadIcon color='white' className='mr-2' />
          <Text className='text-white'>Export Secrets</Text>
        </Button>
        <Button
          onPress={handleImport}
          className='rounded-full bg-green-500 active:bg-green-600 flex-row gap-4'
        >
          <UploadIcon color='white' className='mr-2' />
          <Text className='text-white'>Import Secrets</Text>
        </Button>
      </View>
    </View>
  );
}
