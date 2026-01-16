import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id?: number | string;
        email?: string;
        location?: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};
