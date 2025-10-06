import { Magic } from "magic-sdk";

let magic: Magic | null = null;

export function getMagic() {
  if (typeof window === "undefined") throw new Error("client only");
  if (magic) return magic;

  // Put your public Magic publishable key in .env as VITE_MAGIC_PUBLISHABLE_KEY
  magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
    extensions: [], // optional
  });

  return magic;
}
