import express from "express";

const app = express();
app.use(express.json());

//PASSWORD====================
import bcrypt from "bcrypt";
//============================
//DATABASE====================
import mongoose from 'mongoose';
import {UserCollection, ContentCollection, TagsCollection, LinkCollection,} from "./db";
mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
//============================
//TYPES========================
type User = {
  username: string;
  password: string;
};

//ROUTES=======================
app.get("/", (req, res) => {
  res.send("Welcome to the second mind");
});

//user sign up
app.post("/api/v1/signup", async function (req, res) {
  //add zod validation
  const user: User = {
    username: req.body.username,
    password: req.body.password,
  };

  const hashedPassword = await bcrypt.hash(user.password, 5);

  try{
    //try creating the user in db
    const isUserCreated = UserCollection.create()
  }
});

app.post("/api/v1/signin", (req, res) => {});

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
