import { Magic } from "@magic-sdk/admin";

const magic = new Magic(process.env.MAGIC_SECRET_KEY); // from Magic dashboard

export async function verifyMagicDid(didToken) {
  // Throws if invalid
  await magic.token.validate(didToken);

  // Decode claims (issuer is the user identifier; email if requested)
  const metadata = await magic.users.getMetadataByToken(didToken);
  // metadata: { issuer, publicAddress, email, phoneNumber, ... }

  return {
    issuer: metadata.issuer,
    email: metadata.email,
    publicAddress: metadata.publicAddress,
  };
}
