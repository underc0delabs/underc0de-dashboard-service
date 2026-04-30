import { NextFunction, Request, Response } from "express";

export const createSimpleWindowRateLimiter = (opts: {
  windowMs: number;
  max: number;
  key: (req: Request) => string;
}) => {
  const buckets = new Map<
    string,
    { count: number; windowStartMs: number }
  >();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.key(req);
    const now = Date.now();

    let b = buckets.get(key);
    if (!b || now - b.windowStartMs >= opts.windowMs) {
      b = { count: 0, windowStartMs: now };
    }

    b.count += 1;
    buckets.set(key, b);

    if (b.count > opts.max) {
      return res.status(429).json({
        status: 429,
        success: false,
        msg: "Demasiadas solicitudes, probá más tarde",
        result: null,
        pagination: null,
      });
    }

    next();
  };
};
