import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  adminId?: number;
  adminUsername?: string;
}

// Auth removed — all admin routes are publicly accessible
export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  req.adminId = 1;
  req.adminUsername = "admin";
  next();
}
