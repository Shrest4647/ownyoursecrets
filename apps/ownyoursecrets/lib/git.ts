import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import ExpoIsomorphicFS from "@repo/expo-isomorphic-fs";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";
import { GIT_SYNC_ENABLED_KEY, VAULT_DIR } from "@/store/constants";

const REPO_DIR = FileSystem.documentDirectory + VAULT_DIR; // Directory within the app's sandboxed storage for the git repo

// Initialize the filesystem
const fs = new ExpoIsomorphicFS(REPO_DIR);
const pfs = fs.promises; // Promise-based API for convenience

// Helper to get authentication for private repos
const onAuth = async () => {
  const pat = await SecureStore.getItemAsync("github_pat"); // Assuming 'github_pat' is the key for the PAT
  if (pat) {
    return { username: pat }; // For GitHub, the token is used as the username
  }
  return {};
};

// CORS proxy for remote operations. For production, host your own.
const CORS_PROXY = "https://cors.isomorphic-git.org";

export const initGitRepo = async () => {
  try {
    await git.init({ fs });
    console.log("Git repository initialized.");
    return true;
  } catch (e) {
    console.error("Error initializing Git repository:", e);
    throw e;
  }
};

export const cloneGitRepo = async (repoUrl: string) => {
  try {
    console.log(`Cloning repository from ${repoUrl}...`, REPO_DIR);
    pfs.mkdir(REPO_DIR, { intermediates: true });
    console.log("Created directory for Git repository:", REPO_DIR, "\n");
    await git.clone({
      fs,
      http,
      dir: ".",
      url: repoUrl,
      singleBranch: true,
      depth: 10, // Shallow clone to save space
      corsProxy: CORS_PROXY,
      onAuth,
    });
    console.log("Repository cloned successfully.");
    return true;
  } catch (e) {
    console.error("Error cloning repository:", e);
    throw e;
  }
};

export const pullGitRepo = async () => {
  try {
    await git.pull({
      fs,
      http,
      dir: ".",
      author: { name: "OwnYourSecrets App", email: "app@ownyoursecrets.com" }, // Needed for merge commits
      corsProxy: CORS_PROXY,
      onAuth,
    });
    console.log("Pull successful.");
    return true;
  } catch (e: any) {
    console.error("Error pulling changes:", e);
    // Handle merge conflicts: isomorphic-git throws an error on conflict
    if (e.code === "MergeConflict") {
      console.warn(
        "Merge conflict detected. Manual resolution may be required."
      );
      // In a real app, you'd likely want to expose this to the user
      // For now, we'll just re-throw or handle as a specific error type
      throw new Error("Merge conflict detected. Please resolve manually.");
    }
    throw e;
  }
};

export const pushGitRepo = async () => {
  try {
    await git.push({
      fs,
      http,
      dir: ".",
      corsProxy: CORS_PROXY,
      onAuth,
    });
    console.log("Push successful.");
    return true;
  } catch (e) {
    console.error("Error pushing changes:", e);
    throw e;
  }
};

export const commitChanges = async (message: string) => {
  try {
    console.log("Committing changes with message:", message);
    const status = await git.statusMatrix({ fs, dir: "." });
    console.log("Current Git status:", status);
    const filesToAdd = status
      .filter(([, , worktreeStatus]) => worktreeStatus === 2)
      .map(([filepath]) => {
        console.log("File to add:", filepath);

        return filepath.split(`/${REPO_DIR}/`)[1]; // Remove the repo directory prefix
      })
      .filter((filepath) => filepath && !filepath.endsWith(".json")); // Ignore JSON files

    if (filesToAdd.length > 0) {
      for (const file of filesToAdd) {
        console.log(`######### Adding file to staging: ${file}`);
        await git.add({ fs, dir: ".", filepath: [file] });
      }
      console.log(`Added ${filesToAdd.length} files to staging.`);
    } else {
      console.log("No changes to commit.");
      return false;
    }

    const sha = await git.commit({
      fs,
      dir: ".",
      message,
      author: { name: "OwnYourSecrets App", email: "app@ownyoursecrets.com" },
    });
    console.log(`Commit successful: ${sha}`);
    return true;
  } catch (e) {
    console.error("Error committing changes:", e);
    throw e;
  }
};

export const getGitStatus = async () => {
  try {
    const status = await git.statusMatrix({ fs, dir: "." });
    return status;
  } catch (e) {
    console.error("Error getting Git status:", e);
    return [];
  }
};

export const isGitRepoInitialized = async () => {
  try {
    const stats = await pfs.stat(`/.git`);
    console.log("Git repository stats:", stats);
    return stats.isDirectory; // Check if .git directory exists
  } catch (e) {
    return false; // Directory does not exist or other error
  }
};

export const getRepoContents = async (path: string = "") => {
  try {
    const files = await pfs.readdir(path === "" ? "." : path);
    return files;
  } catch (e) {
    console.error("Error reading repository contents:", e);
    return [];
  }
};
type TreeNode = {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
};

export const getRepoTree = async (currentPath: string = "") => {
  try {
    const fullPath =
      currentPath === "" ? REPO_DIR : `${REPO_DIR}/${currentPath}`;
    const files = await pfs.readdir(fullPath);
    const tree: TreeNode[] = [];

    for (const file of files) {
      const itemPath = `${fullPath}/${file}`;
      const relativeItemPath =
        currentPath === "" ? file : `${currentPath}/${file}`;
      let stats;
      try {
        stats = await pfs.stat(itemPath);
      } catch (statError) {
        console.warn(`Could not stat ${itemPath}:`, statError);
        continue;
      }

      if (stats.isDirectory()) {
        if (file === ".git") {
          continue; // Ignore .git directory
        }
        tree.push({
          id: relativeItemPath,
          name: file,
          path: relativeItemPath,
          isDirectory: true,
          children: await getRepoTree(relativeItemPath),
        });
      } else {
        if (file.endsWith(".json") || file.endsWith(".jsop")) {
          tree.push({
            id: relativeItemPath,
            name: file,
            path: relativeItemPath,
            isDirectory: false,
          });
        }
      }
    }
    return tree;
  } catch (e) {
    console.error("Error getting repository tree:", e);
    return [];
  }
};

export const isGitSyncEnabled = async () => {
  const gitSyncValue = await SecureStore.getItemAsync(GIT_SYNC_ENABLED_KEY);
  return gitSyncValue === "true";
};

export const commitAndPush = async (message: string) => {
  try {
    const isEnabled = await isGitSyncEnabled();
    console.log("Git sync enabled:", isEnabled);
    if (!isEnabled) {
      console.log("Git sync is not enabled. Skipping commit and push.");
      return;
    }

    const isInitialized = await isGitRepoInitialized();
    console.log("Git repository initialized:", isInitialized);
    if (!isInitialized) {
      console.log("Git repository not initialized. Skipping commit and push.");
      return;
    }

    await commitChanges(message);
    await pushGitRepo();
    console.log("Changes committed and pushed successfully.");
  } catch (error) {
    console.error("Error committing and pushing changes:", error);
    throw error;
  }
};
