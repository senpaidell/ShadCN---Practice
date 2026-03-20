// import mongoose from "mongoose";
// MIGHT USE LATER
// export const connectDB = async () => {
//     try{
//         const conn = await mongoose.connect(process.env.MONGO_URI || "");
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (err){
//         console.error(`Error: ${err as Error}.message`);
//         process.exit(1);
//     }
// };

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

// Better debugging: check if URI exists before trying to connect
if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in your environment variables!");
}

let cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!MONGO_URI) throw new Error("Check your .env file - MONGO_URI is missing.");

  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false, // Disable buffering for serverless
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};