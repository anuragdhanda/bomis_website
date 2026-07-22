import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "birla-open-minds-secret-2024";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    return decoded;
  } catch {
    return null;
  }
}
