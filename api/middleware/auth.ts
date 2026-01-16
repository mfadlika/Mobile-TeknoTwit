import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret";
const TEKNOKRAT_EMAIL_DOMAIN = "@teknokrat.ac.id";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!headerValue)
    return res.status(401).json({ message: "Missing Authorization header" });

  const parts = headerValue.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    // payload expected to contain at least `id`
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function authLocationMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!headerValue)
    return res.status(401).json({ message: "Missing Authorization header" });

  const parts = headerValue.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    const email = String(payload.email || "").toLowerCase();
    const location = String(payload.location || "").toLowerCase();

    if (location && location !== "teknokrat") {
      return res.status(403).json({ message: "Access restricted by location" });
    }
    if (!location && !email.endsWith(TEKNOKRAT_EMAIL_DOMAIN)) {
      return res.status(403).json({ message: "Access restricted by location" });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default authMiddleware;
export { authLocationMiddleware as authLocation };
