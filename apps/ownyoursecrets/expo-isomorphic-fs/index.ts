import * as FileSystem from "expo-file-system";

import { ENOENT } from "./errors";
interface FileStats {
  /**
   * The file mode (permissions). Git primarily cares about the executable bit.
   * e.g., 0o100644 for a regular file, 0o100755 for an executable.
   */
  mode: number;

  /**
   * The size of the file in bytes.
   */
  size: number;

  /**
   * The last modification time, as a high-resolution timestamp in milliseconds.
   */
  mtimeMs: number;

  /**
   * The last metadata change time, as a high-resolution timestamp in milliseconds.
   * Git uses this to quickly detect if a file has changed since it was last indexed.
   */
  ctimeMs: number;

  /**
   * A method to check if the entry is a directory.
   * @returns {boolean}
   */
  isDirectory(): boolean;

  /**
   * A method to check if the entry is a regular file.
   * @returns {boolean}
   */
  isFile(): boolean;

  /**
   * A method to check if the entry is a symbolic link.
   * @returns {boolean}
   */
  isSymbolicLink(): boolean;

  // Other properties like 'uid', 'gid', 'dev', 'ino' might be present when running
  // in a full Node.js environment, but are often omitted or set to 0 in browser/abstracted
  // environments as they are not relevant to Git's core logic.
  uid?: number;
  gid?: number;
}
interface FsPromises {
  init(name: string, options?: any): Promise<void>;
  mkdir(path: string, options?: FileSystem.MakeDirectoryOptions): Promise<void>;
  rmdir(path: string, options?: any): Promise<void>;
  readdir(path: string): Promise<string[]>;
  writeFile(
    path: string,
    data: string | Uint8Array,
    options?: { encoding?: FileSystem.EncodingType; mode?: number } | string
  ): Promise<void>;
  readFile(
    path: string,
    options?: { encoding?: FileSystem.EncodingType } | string
  ): Promise<string | Uint8Array>;
  unlink(path: string, options?: any): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  stat(path: string): Promise<FileStats>;
  lstat(path: string): Promise<FileStats>;
  symlink(target: string, path: string): Promise<void>;
  readlink(path: string): Promise<string>;
  backFile(path: string, options?: any): Promise<void>;
  du(path: string): Promise<number>;
  flush(): Promise<void>;
}

class ExpoIsomorphicFS {
  private _baseDir: string;

  constructor(baseDir: string) {
    this._baseDir = baseDir.endsWith("/") ? baseDir : `${baseDir}/`;
  }

  private _getPath(path: string): string {
    // Ensure path is absolute and within the base directory
    if (path.startsWith(this._baseDir)) {
      return path;
    }
    return `${this._baseDir}${path.startsWith("/") ? path.substring(1) : path}`;
  }

  public promises: FsPromises = {
    init: async (name, options) => {
      // No-op for now, as expo-file-system doesn't require explicit initialization like IndexedDB
      console.log(
        `ExpoIsomorphicFS.init called with name: ${name}, options: ${JSON.stringify(options)}`
      );
    },

    mkdir: async (path, options) => {
      console.log(
        `Creating directory at path: ${path}, options: ${JSON.stringify(options)}`
      );
      const fullPath = this._getPath(path);
      await FileSystem.makeDirectoryAsync(fullPath, {
        ...options,
        intermediates: true,
      });
    },

    rmdir: async (path, options) => {
      const fullPath = this._getPath(path);
      // For directories, we need to ensure it's recursive
      await FileSystem.deleteAsync(fullPath, { ...options, idempotent: true });
    },

    readdir: async (path) => {
      console.log(`Reading directory at path: ${path}`);
      const fullPath = this._getPath(path);
      const files = await FileSystem.readDirectoryAsync(fullPath);
      return files;
    },

    writeFile: async (path, data, options) => {
      console.log(
        `Writing file at path: ${path}, data type: ${typeof data}, options: ${JSON.stringify(options)}`
      );
      const fullPath = this._getPath(path);
      let encoding: FileSystem.EncodingType = FileSystem.EncodingType.UTF8;
      if (typeof options === "object" && options?.encoding) {
        encoding = options.encoding as FileSystem.EncodingType;
      } else if (typeof options === "string") {
        encoding = options as FileSystem.EncodingType;
      }

      let dataToWrite: string;
      if (data instanceof Uint8Array) {
        dataToWrite = Buffer.from(data).toString(encoding);
      } else {
        dataToWrite = data;
      }

      await FileSystem.writeAsStringAsync(fullPath, dataToWrite, { encoding });
    },

    readFile: async (path, options) => {
      console.log(
        `Reading file at path: ${path}, options: ${JSON.stringify(options)}`
      );
      const fullPath = this._getPath(path);
      let encoding: FileSystem.EncodingType = FileSystem.EncodingType.UTF8;
      if (typeof options === "object" && options?.encoding) {
        encoding = options.encoding as FileSystem.EncodingType;
      } else if (typeof options === "string") {
        encoding = options as FileSystem.EncodingType;
      }

      const content = await FileSystem.readAsStringAsync(fullPath, {
        encoding,
      });
      if (encoding === FileSystem.EncodingType.Base64) {
        return Buffer.from(content, "base64");
      }
      return content;
    },

    unlink: async (path, options) => {
      const fullPath = this._getPath(path);
      await FileSystem.deleteAsync(fullPath, { ...options, idempotent: true });
    },

    rename: async (oldPath, newPath) => {
      console.log(`Renaming from ${oldPath} to ${newPath}`);
      const fullOldPath = this._getPath(oldPath);
      const fullNewPath = this._getPath(newPath);
      await FileSystem.moveAsync({
        from: fullOldPath,
        to: fullNewPath,
      });
    },

    stat: async (path) => {
      console.log(`Getting stats for path: ${path}`);
      const fullPath = this._getPath(path);
      const info = await FileSystem.getInfoAsync(fullPath);
      if (!info.exists) {
        throw new ENOENT(`no such file or directory, stat '${fullPath}'`);
      }

      return {
        ...info,
        mode: 0o100644, // Default mode for regular files
        mtimeMs: info.modificationTime,
        ctimeMs: info.modificationTime,
        isFile: () => !info.isDirectory,
        isSymbolicLink: () => false, // expo-file-system does not support symlinks
        isDirectory: () => info.isDirectory,
      };
    },

    lstat: async (path) => {
      // expo-file-system's getInfoAsync does not differentiate between symlinks and files
      return this.promises.stat(path);
    },

    symlink: async (target, path) => {
      console.warn("symlink not fully supported by expo-file-system");
      // Placeholder: In a real scenario, you might want to store symlink info in a separate file
      throw new Error("symlink not supported");
    },

    readlink: async (path) => {
      console.warn("readlink not fully supported by expo-file-system");
      // Placeholder: In a real scenario, you would read the symlink info from a stored file
      throw new Error("readlink not supported");
    },

    backFile: async (path, options) => {
      console.warn("backFile not supported by expo-file-system");
      throw new Error("backFile not supported");
    },

    du: async (path) => {
      console.warn("du not fully supported by expo-file-system");
      // This would require recursively summing up file sizes, which is not directly available
      throw new Error("du not supported");
    },

    flush: async () => {
      // No-op for now, as expo-file-system doesn't have a concept of flushing like IndexedDB
      console.log("ExpoIsomorphicFS.flush called");
    },
  };
}
export default ExpoIsomorphicFS;
