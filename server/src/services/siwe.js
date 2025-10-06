import { createHash } from "crypto";
import { recoverAddress, hashMessage } from "viem";

export function makeNonce() {
  return createHash("sha256").update(Math.random().toString(36)).digest("hex").slice(0, 12);
}

export async function verifySiwe({ message, signature, expectedNonce }) {
  // naive parse: grab the "Nonce: ..." line from your message
  const nonceLine = message.split("\n").find((l) => l.startsWith("Nonce: "));
  const nonce = nonceLine?.split("Nonce: ")[1]?.trim();
  if (!nonce || nonce !== expectedNonce) throw new Error("bad nonce");

  const addr = await recoverAddress({
    hash: hashMessage(message),
    signature,
  });

  return addr; // recovered EOA
}
