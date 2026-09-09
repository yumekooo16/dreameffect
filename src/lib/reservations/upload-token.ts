import { createHash, randomBytes } from "crypto";

export function generateUploadToken() {
  return randomBytes(32).toString("base64url");
}

export function hashUploadToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
