function Err(name: string) {
  return class extends Error {
    public code: string;
    constructor(...args: any[]) {
      super(...args);
      this.code = name;
      if (this.message) {
        this.message = name + ": " + this.message;
      } else {
        this.message = name;
      }
    }
  };
}

const EEXIST = Err("EEXIST");
const ENOENT = Err("ENOENT");
const ENOTDIR = Err("ENOTDIR");
const ENOTEMPTY = Err("ENOTEMPTY");
const ETIMEDOUT = Err("ETIMEDOUT");
const EISDIR = Err("EISDIR");

export { EEXIST, ENOENT, ENOTDIR, ENOTEMPTY, ETIMEDOUT, EISDIR };
