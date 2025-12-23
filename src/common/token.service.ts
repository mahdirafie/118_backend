import jwt from "jsonwebtoken";

function getSecret(envVar: string): string {
  const secret = process.env[envVar];
  if (!secret) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
  return secret;
}

// generate token
export function createAccessToken(payload: object) {
  return jwt.sign(payload, getSecret("ACCESS_TOKEN_SECRET"), {
    expiresIn: "15m",
  });
}

export function createRefreshToken(payload: object) {
  return jwt.sign(payload, getSecret("REFRESH_TOKEN_SECRET"), {
    expiresIn: "60d",
  });
}

// verify token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, getSecret("ACCESS_TOKEN_SECRET"));
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, getSecret("REFRESH_TOKEN_SECRET"));
}
