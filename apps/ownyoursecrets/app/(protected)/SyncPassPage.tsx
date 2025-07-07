import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { View, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { exportVault, importVault } from "@/lib/vault";
import { useAuth } from "@/store/auth-context";
import {
  DownloadIcon,
  UploadIcon,
  GitPullRequestArrow,
  HardDrive,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Label } from "@/components/ui/label";

export default function SyncPassPage() {
  const [syncStatus, setSyncStatus] = useState("Idle");
  const [currentSyncOption, setCurrentSyncOption] = useState("None"); // e.g., "Git", "Drive", "None"
  const { ageSecretKey } = useAuth()!;
  const router = useRouter();

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
        <Text className='text-xl font-semibold mb-2 text-foreground'>
          Sync Status
        </Text>
        <View className='flex-row items-center gap-4'>
          <Label className='text-foreground mb-2'>Current Sync Option:</Label>
          <Text className='text-muted-foreground mb-2'>
            {currentSyncOption}
          </Text>
        </View>

        <View className='flex-row items-center gap-4 mb-4'>
          <Label className='text-foreground mb-2'>Sync Status:</Label>
          <Text className='text-muted-foreground mb-4'>{syncStatus}</Text>
        </View>

        <View className='flex-row justify-around mb-4'>
          <Button
            variant='outline'
            onPress={() => {
              Alert.alert("Coming Soon", "Git sync is not yet implemented.");
              // setCurrentSyncOption("Git");
              // router.push("../(guest)/GitSyncRepoSetupPage");
            }}
            className={`rounded-full flex-row gap-2`}
          >
            <GitPullRequestArrow color='gray' />
            <Text className='text-foreground'>Sync to Git</Text>
          </Button>
          <Button
            variant='default'
            onPress={() => {
              setCurrentSyncOption("Drive");
              Alert.alert("Coming Soon", "Drive sync is not yet implemented.");
            }}
            className={`rounded-full flex-row gap-2`}
          >
            <HardDrive color='white' />
            <Text className='text-white'>Sync to Drive</Text>
          </Button>
        </View>
        {currentSyncOption !== "None" && (
          <Button
            onPress={handleSync}
            className='rounded-full bg-primary-500 active:bg-primary-600'
          >
            <Text className='text-white'>Trigger Sync</Text>
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
