import { Request, Response, NextFunction } from "express";

// Middleware to check if the user is authenticated
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Middleware to check if the user is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin only" });
  }
  next();
}
