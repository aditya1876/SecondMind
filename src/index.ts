import express from "express";
import { Request, Response } from "express";
import {
  parseCreds,
  generateUserToken,
  hashPassword,
  comparePasswords,
  checkJWT,
  // UserInRequestObject,
} from "./commonUtils";
import { User, Content } from "./dataTypes";
import { UsersCollection, ContentCollection } from "./db";

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

    const hashedPassword: string | undefined = await hashPassword(
      user.password,
    ); //hash the password
    if (typeof hashedPassword === "undefined") {
      console.log(`Error occured during password hash operation`);
      res.status(500).json({
        message: "Something went wrong, please try again!",
      });
    }

    try {
      //check data exists in database
      const userExists = await UsersCollection.create({
        username: user.username,
        password: hashedPassword,
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

app.post(
  "/api/v1/signin",
  parseCreds,
  async function (req: Request, res: Response) {
    console.log("Signin flow -->");
    const user: User = {
      username: req.body.username,
      password: req.body.password,
    };

    //check if user already exists
    const userExists = await UsersCollection.findOne({
      username: user.username,
    });
    console.log(`UserExists: [${userExists}]`);
    if (userExists == null) {
      res.status(403).json({
        message: `User with username: [${user.username}] not found!`,
      });
    } else {
      //compare passord
      const comparePassword = await comparePasswords(
        user.password,
        userExists.password,
      );

      if (typeof comparePassword === "undefined") {
        console.log(`Error occured during password compare operation`);
        res.status(500).json({
          message: "Something went wrong, please try again!",
        });
      }
      if (comparePassword) {
        //generate token for the user
        const token: String | undefined = generateUserToken(user.username); //generate token
        if (typeof token === "undefined") {
          console.log(`Token genaration failed for user [${user.username}]`);
          res.status(500).json({
            message: "Unable to generate token. Please try again!",
          });
        } else if (typeof token === "string") {
          console.log(`Signin successful. token: [${token}]`);
          res.status(200).json({
            token: token,
          });
        }
      } else {
        console.log(`Password comparision failed for user [${user.username}]`);
        res.status(403).json({
          message: "incorrect username and passoword combination",
        });
      }
    }
    console.log("<--");
  },
);

app.post(
  "/api/v1/content",
  checkJWT,
  async function (req: Request, res: Response) {
    console.log("Adding new content-->");

    const content: Content = {
      type: req.body.type,
      link: req.body.link,
      title: req.body.title,
      tags: req.body.tags,
    };

    //get the user from request object(added by checkJWT)
    const username = req.body.username;

    //add entry in to the content table
    try {
      console.log("Adding content to db...");
      const userdata = await UsersCollection.find({
        username: username,
      });
      console.log(`User data for username: [${username}] is: [${userdata}]`);
      const datamap = new Map(Object.entries(userdata));
      Object.entries(userdata).find({ _id: Types.ObjectId });

      console.log(`datamap: [${datamap}]`);
      const userId = datamap.get("_id");
      console.log(`Userid: [${userId}]`);
      const entryAdded = await ContentCollection.create({
        type: content.type,
        link: content.link,
        title: content.title,
        tags: content.tags,
        userId: userId,
      });
      console.log(`Content addition status: [${entryAdded}]`);
    } catch (e) {
      console.log("Error during addition of content in content table");
      console.log(e);
      res.status(500).json({
        message: "Something  went wrong, please try again",
      });
    }
    console.log("<--");
  },
);

app.get(
  "/api/v1/content",
  checkJWT,
  async function (req: Request, res: Response) {
    console.log("Display all content for the user -->");

    //get the username from reqest (added by checkJWT)
    const username = req.body.username;

    try {
      console.log(`Getting content for user: [${username}]`);
      const userData = await UsersCollection.find({
        username: username,
      });
      console.log(`userData: [${userData}]`);
      const datamap = new Map(Object.entries(userData));
      const userId = datamap.get("userId");
      const allUserData = await ContentCollection.find({
        userId: userId,
      });
      console.log(`All user data: [${allUserData}]`);

      res.status(200).json({
        allData: allUserData,
      });
    } catch (e) {
      console.log(
        `Error occured during fetching user data for user: [${username}]`,
      );
      console.log(e);
      res.status(500).json({
        message: "Something went wrong, please try again",
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
