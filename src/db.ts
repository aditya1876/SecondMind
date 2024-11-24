import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

//DB CONNECTION
const connectionString = process.env.MONGODB_CONNECTION_STRING;
export async function connectToDB() {
  console.log("Attempting to connect to database...");
  try {
    if (connectionString) {
      await mongoose.connect(connectionString);
      console.log("Connected to the database");
    } else {
      console.log("DB connection parameters not correct");
    }
  } catch (e) {
    console.log("Unable to connect to the database");
  }
  //mongoose.connect(process.env.MONGODB_CONNECTION_STRING!);
  //add ! at the end of above command to stop typescript from assuming the value could be null
}

connectToDB();

//USERS SCHEMA
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//TAGS SCHEMA
const TagsSchema = new Schema({
  title: { type: String, requried: true, unique: true },
});

//CONTENT SCHEMA
const contentTypes = ["image", "video", "article", "audio"];

const ContentSchema = new Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "TagsCollection" }],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserCollection",
    required: true,
    validate: async function (value: string) {
      const user = await UserCollection.findById(value);
      if (!user) {
        throw new Error(`User: ${user} does not exist!`);
      }
    },
  },
});

//LINK SCHEMA
const LinkSchema = new Schema({
  hash: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UsersCollection",
    required: true,
  },
});

export const UserCollection = mongoose.model("users_table", UserSchema);
export const ContentCollection = mongoose.model("content_table", ContentSchema);
export const TagsCollection = mongoose.model("tags_table", TagsSchema);
export const LinkCollection = mongoose.model("links_table", LinkSchema);

// module.exports = {
//   UserCollection,
//   ContentCollection,
//   TagsCollection,
//   LinkCollection,
// };
