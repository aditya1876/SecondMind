import { Request, Response } from "express";
import express from "express";
import { parseCreds, jwtSign } from "./commonUtils";
const app = express();
app.use(express.json());

//PASSWORD====================
import bcrypt from "bcrypt";
//============================
//DATABASE====================
import mongoose from "mongoose";
import {
  UserCollection,
  ContentCollection,
  TagsCollection,
  LinkCollection,
} from "./db";
//============================
//TYPES=======================
type User = {
  username: string;
  password: string;
};
//ROUTES======================
app.get("/", function (req: Request, res: Response): void {
  res.json({ message: "Welcome to the second mind" });
  console.log("Landing page displayed.");
});

//user sign up
app.post("/api/v1/signup", parseCreds, async function (req, res) {
  const user: User = {
    username: req.body.username,
    password: req.body.password,
  };

  //validate user inputs in zod
  // const parseResult = parseCreds(user.username, user.password);
  // if (!parseResult) {
  //   res.status(411).json({
  //     message: "Username or password are not in correct format",
  //   });
  // }

  //check if user already exists
  const userExists = await UserCollection.findOne({ username: user.username });
  console.log(`Does user already exist?: [${userExists}]`);
  if (!userExists) {
    res.status(403).json({
      message: `User already exists with username: [${user.username}]`,
    });
  }

  //try creating the user in db
  try {
    const hashedPassword = await bcrypt.hash(user.password, 5);

    const isUserCreated = await UserCollection.create({
      username: user.username,
      password: hashedPassword,
    });
    console.log(
      `New user creation status: [${isUserCreated ? "success" : "failure"}]`,
    );

    res.status(200).json({
      message: `User creation successful. Username: [${user.username}]`,
    });
  } catch (e) {
    console.log("Error in creating new user in db.");
    res.status(403).json({
      message: `User with the provided username : [${user.username}] already exists.`,
    });
  }
});

app.post("/api/v1/signin", parseCreds, async function (req, res) {
  const user: User = {
    username: req.body.username,
    password: req.body.password,
  };

  //validate the user input
  // const parseResult = parseCreds(user.username, user.password);
  // console.log(`Result of parsing: [${parseResult}]`);
  // if (!parseResult) {
  //   res.status(411).json({
  //     message: "User credentials are not in correct format--1",
  //   });
  // }

  //check if user exists in db, if yes, do signin
  try {
    const userExists = await UserCollection.findOne({
      username: user.username,
    });
    console.log(`User exists in db? [${userExists ? "Yes" : "No"}]`);
    if (!userExists) {
      res.status(403).json({
        message: `User with username: [${user.username}] not found in db.`,
      });
    } else {
      //compare passords
      const passwordCompare = await bcrypt.compare(
        user.password,
        userExists.password,
      );
      console.log(`Result of password compare: [${passwordCompare}]`);
      if (!passwordCompare) {
        res.status(411).json({
          message: `Username or password do not match with our records`,
        });
      }

      //sign using jwt
      const jwtToken = jwtSign(userExists._id.toString());
      console.log(`Token value: ${jwtToken}`);
      res.status(200).json({ token: jwtToken });
      console.log("Sign successful");
    }
  } catch (e) {
    res.status(500).json({ message: "Something went wrong during signin" });
  }
});

//create a new content
app.post("/api/v1/content", (req, res) => {});

//view all of my content
app.get("/api/v1/content", (req, res) => {});

//delete my content
app.delete("/api/v1/content", (req, res) => {});

//create a sharable link
app.post("/api/v1/brain/share", (req, res) => {});

//View other person's shared link
app.get("/api/v1/brain/:sharedLink", (req, res) => {});

//LISTENING=========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is runnin on port: ${PORT}`);
});
