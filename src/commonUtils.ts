import zod from "zod";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

//ZOD SCHEMAS============
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

  next();
}

//=======================
//OTHER FUNCTIONS========
//Hash passowrd of the user before saving in db
export async function hashPassword(
  password: string,
): Promise<string | undefined> {
  console.log(`Hashing password`);
  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    console.log("Password Hashed");
    console.log(`Hashed pass: [${hashedPassword}]`);
    return hashedPassword;
  } catch (e) {
    console.log("Error during hashing password");
    console.log(e);
    return;
  }
}

//Compare userpassword with hashed db password
export async function comparePasswords(
  userPassword: string,
  dbPassword: string,
): Promise<boolean | undefined> {
  console.log("Verifying password provided by user...");
  try {
    const passwordCompare = await bcrypt.compare(userPassword, dbPassword);
    console.log(`Vefication completed. Result: [${passwordCompare}]`);
    return passwordCompare;
  } catch (e) {
    console.log("Error during password comparision");
    console.log(e);
    return;
  }
}

//generate JWT token for user that is signing in
export function generateUserToken(username: string): string | undefined {
  console.log(`Generating jwt token for the user: [${username}]`);
  try {
    const jwt_secret = process.env.JWT_SECRET!;
    const token = jwt.sign({ username: username }, jwt_secret);
    console.log(`Token generated for the user: [${username}] succesfully!`);
    return token;
  } catch (e) {
    console.log(`Error generating token for user: [${username}]`);
    console.log(e);
    return; //handle undefined error when reading token value in calling funciton
  }
}
//=======================
