import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET (or SESSION_SECRET) environment variable must be set. " +
      "The server will not start without a signing secret."
    );
  }
  return secret;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: number; username: string };
    return decoded;
  } catch {
    return null;
  }
}
