import zod from "zod";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

//ZOD SCHEMAS============
// const usernameSchema = zod
//   .string()
//   .min(3, { message: "username should be atleast 3 characters" })
//   .max(10, { message: "Username should be less than 10 characters." });
// const passwordSchema = zod
//   .string()
//   .min(8, { message: "password should be atleast 8 characters" })
//   .max(20, { message: "password should be less than 21 characters" });

const userSchema = zod.object({
  username: zod
    .string()
    .min(3, { message: "username should be atleast 3 characters" })
    .max(10, { message: "Username should be less than 10 characters." }),
  password: zod
    .string()
    .min(8, { message: "password should be atleast 8 characters" })
    .max(20, { message: "password should be less than 21 characters" })
    .regex(/^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=_-]).*)$/, {
      message:
        "password should contain atleast 1 digit, 1 lowercase, 1 uppercase and 1 special character",
    }),
});

//=======================

//MIDDLEWARE=============
export function parseCreds(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userParse = userSchema.safeParse(req.body);
  if (!userParse.success) {
    //get all validation failures
    let errData = userParse.error.issues; //type Object
    let errMsg: Array<string> = [];
    Object.entries(errData).forEach((value, key) => {
      errMsg.push(value[1].message);
    });

    res.status(411).json({
      message: "Username or password are not in valid format",
      failures: errMsg,
    });
    return;
  }
  // const usernameParse = usernameSchema.safeParse(req.body.username);
  // const passwordParse = passwordSchema.safeParse(req.body.password);
  // if (!usernameParse.success || !passwordParse.success) {
  //   res.status(411).json({
  //     message: "Username or password are not in valid format",
  //   });
  //   return;
  // }

  next();
}

//=======================
//OTHER FUNCTIONS========
//
//=======================
