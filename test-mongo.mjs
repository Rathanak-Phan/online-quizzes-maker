// test-mongo.mjs
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://studyingalaxy123_db_user:2SeVY7ydsk7xeW7@online-quizzes-maker.cd0nedo.mongodb.net/online-quizzes?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("BRO, YOU ARE CONNECTED TO MONGODB! 🎉");
  } catch (error) {
    console.error("Still failed:", error.message);
  } finally {
    await client.close();
  }
}

run();