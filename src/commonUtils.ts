import zod from "zod";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

//ZOD SCHEMA
const usernameSchema = zod
  .string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  })
  .min(3, { message: "Username must be between 3-19 characters" })
  .max(10, { message: "Username must be less than 11 characters" });

const passwordSchema = zod
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(8, { message: "Password must be atleast 8 characters" })
  .max(20, { message: "Password must be less than 21 characters" });

export function jwtSign(id: string): string {
  //sign the id with a jwt token
  const secret: string = process.env.JWT_SECRET || "";
  return jwt.sign({ id: id.toString() }, secret);
}

//MIDDLEWARES

export function parseCreds(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const usernameParse = usernameSchema.safeParse(req.body.username);
  const passwordParse = passwordSchema.safeParse(req.body.password);

  if (!usernameParse.success || !passwordParse.success) {
    res.status(403).json({
      message: "User credentials are not in proper format testing",
    });
  }
}

export function parseCreds1(username: string, password: string): boolean {
  let flag = false;

  if (
    usernameSchema.safeParse(username).success &&
    passwordSchema.safeParse(password).success
  ) {
    flag = true;
  }

  return flag;
}
