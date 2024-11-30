import mongoose from "mongoose";

//DB SCHEMA============
//users table
const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const TagSchema = new mongoose.Schema({
  tag: { type: String, requried: true, unique: true },
});

const contentTypes = ["image", "video", "article", "audio"];
const ContentSchema = new mongoose.Schema({
  link: { type: String, reqruired: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "TagsCollection" }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UsersCollection",
    required: true,
    validate: async function (value: string): Promise<void> {
      const user = await UsersCollection.findById(value);
      if (!user) {
        throw new Error(`DB: User [${user}] does not exist in DB!`);
      }
    },
  },
});

const LinkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "UsersCollection",
    required: true,
  },
});
//=====================
//EXPORTS==============
export const UsersCollection = mongoose.model("users_tables", UsersSchema);
export const TagCollection = mongoose.model("tags_tables", TagSchema);
export const ContentCollection = mongoose.model(
  "content_tables",
  ContentSchema,
);
export const LinkCollection = mongoose.model("links_tables", LinkSchema);
//====================

//DB CONNECTION=======
const connectionString = process.env.MONGODB_CONNECTION_STRING!;

export async function connectToDB(): Promise<void> {
  console.log("Connecting to Database...");

  try {
    if (connectionString) {
      await mongoose.connect(connectionString);
      console.log("Successfully connected to DB");
    } else {
      console.log("DB connection parameter is not correct");
    }
  } catch (e) {
    console.log("Something went wrong while connecting to database");
  }
}

//connect to db
// const connected = await connectToDB();
connectToDB();
//====================
