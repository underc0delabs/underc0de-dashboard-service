import { NextFunction, Request, Response } from "express";

export type IJwtValidator = (req: Request, res: Response, next: NextFunction) => Promise<any>