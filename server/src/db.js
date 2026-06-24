import mongoose from "mongoose";

// Connects to MongoDB.
// - If MONGODB_URI is set -> connect to it (e.g. MongoDB Atlas) = the "real" DB.
// - If not set -> spin up an in-memory MongoDB so the app runs with zero setup.
export async function connectDB() {
  let uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.warn(
      "⚠  No MONGODB_URI set — starting an in-memory MongoDB (data is NOT persisted).\n" +
        "   For real, persistent data, add an Atlas connection string to server/.env"
    );
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mem = await MongoMemoryServer.create();
      uri = mem.getUri();
      // keep a reference so it isn't garbage collected
      globalThis.__memMongo = mem;
    } catch (err) {
      console.error(
        "✖  Could not start in-memory MongoDB. Install it (npm i -D mongodb-memory-server)\n" +
          "   or set MONGODB_URI in server/.env to a real MongoDB.",
        err.message
      );
      process.exit(1);
    }
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "sleepscribe" });
  console.log("✓ MongoDB connected");
}
