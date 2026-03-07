import mongoose from "mongoose";

const MONGODB_URL = (() => {
  const url = process.env.MONGODB_URL;
  if (!url) throw new Error("Please define MONGODB_URL in your env file.");
  return url;
})();

let cache = global.mongoose;

if (!cache) {
  cache = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      // FORCE IPv4: This fixes the ECONNREFUSED issue in Node 18+ 
      family: 4, 
    };

    cache.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }

  return cache.conn;
}
