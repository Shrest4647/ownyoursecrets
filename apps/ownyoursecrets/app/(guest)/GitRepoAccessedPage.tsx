import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { getRepoTree } from "../../lib/git";
import TreeView from "react-native-final-tree-view";
import { File, Folder } from "lucide-react-native";

export default function GitRepoAccessedPage() {
  const router = useRouter();
  const [repoTree, setRepoTree] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepoTree = async () => {
      try {
        const tree = await getRepoTree();
        setRepoTree(tree);
      } catch (e: any) {
        setError(e.message || "Failed to load repository contents.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepoTree();
  }, []);

  const renderNode = ({ node, level, isExpanded, hasChild }: any) => (
    <View
      style={{
        marginLeft: 10 * level,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {node.isDirectory ? (
        <Folder size={16} className='text-primary mr-2' />
      ) : (
        <File size={16} className='text-muted-foreground mr-2' />
      )}
      <Text className='text-foreground text-base'>{node.name}</Text>
    </View>
  );

  return (
    <View className='flex-1 p-5 bg-background'>
      <Text className='text-2xl font-bold mb-5 text-foreground'>
        Repository Accessed
      </Text>
      <Text className='text-center mb-5 text-muted-foreground'>
        Repo cloned successfully! Here are the contents:
      </Text>

      {isLoading ? (
        <ActivityIndicator size='large' color='#0000ff' />
      ) : error ? (
        <Text className='text-red-500 text-center'>Error: {error}</Text>
      ) : repoTree.length > 0 ? (
        <ScrollView className='flex-1 mb-5 border border-gray-300 rounded-md p-3'>
          <TreeView
            data={repoTree}
            renderNode={renderNode}
            initialExpanded={false}
          />
        </ScrollView>
      ) : (
        <Text className='text-muted-foreground text-center'>
          The repository is empty or no files were found.
        </Text>
      )}

      <Button onPress={() => router.push("/setup-age-secret")}>
        <Text>Continue</Text>
      </Button>
    </View>
  );
}
