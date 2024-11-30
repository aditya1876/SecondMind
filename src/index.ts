import express from "express";
import { Request, Response } from "express";
import { parseCreds } from "./commonUtils";
import { User } from "./dataTypes";
import { connectToDB, UsersCollection } from "./db";

const app = express();
app.use(express.json());
//DB CONNECTION============
// connectToDB();
//=========================
//ROUTES===================
app.get("/", (req: Request, res: Response) => {
  console.log("Landing page--> ");
  res.status(200).json({
    message: "Welcome to the app",
  });
  console.log("<--");
});

app.post(
  "/api/v1/signup",
  parseCreds,
  async function (req: Request, res: Response) {
    console.log("Singup flow -->");
    const user: User = {
      username: req.body.username,
      password: req.body.password,
    };
    try {
      //check data exists in database
      const userExists = await UsersCollection.create({
        username: user.username,
        password: user.password,
      });

      userExists
        ? res.status(200).json({
            message: `Successfully created a user with username: [${user.username}]`,
          })
        : res
            .status(500)
            .json({ message: `Something went worng during user creation` });

      console.log(`User creation status: [${userExists}]`);
    } catch (e: any) {
      console.log(`User with username: [${user.username}] already exists`);
      console.log(e.message);
      res.status(403).json({
        message: `User already exists with username: [${user.username}]`,
      });
    }

    console.log("<--");
  },
);

const PORT = process.env.PORT!;

app.listen(PORT, (): void => {
  console.log(`App running on port:[${PORT}]`);
});
//=========================
