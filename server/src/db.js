import mongoose from "mongoose";

// Cache the connection across invocations. In serverless (Vercel) the module is
// reused between warm requests, so we must not open a new connection each time —
// we stash the live connection (and the in-flight promise) on globalThis.
const cached = (globalThis.__mongoose ||= { conn: null, promise: null });

// Connects to MongoDB, returning a cached connection on subsequent calls.
// - MONGODB_URI set   -> connect to it (e.g. MongoDB Atlas) = the "real" DB.
//                        REQUIRED in any serverless / production deploy.
// - MONGODB_URI blank -> spin up an in-memory MongoDB (local dev only; this does
//                        NOT work on Vercel).
export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      let uri = process.env.MONGODB_URI?.trim();

      if (!uri) {
        console.warn(
          "⚠  No MONGODB_URI set — starting an in-memory MongoDB (data is NOT persisted).\n" +
            "   This only works locally. For a real/deployed DB, set MONGODB_URI to a\n" +
            "   MongoDB Atlas connection string."
        );
        // Variable specifier keeps bundlers/tracers (Vercel) from trying to
        // include this dev-only dependency in the serverless bundle.
        const pkg = "mongodb-memory-server";
        const { MongoMemoryServer } = await import(pkg);
        const mem = await MongoMemoryServer.create();
        uri = mem.getUri();
        globalThis.__memMongo = mem; // keep a ref so it isn't GC'd
      }

      mongoose.set("strictQuery", true);
      await mongoose.connect(uri, { dbName: "sleepscribe" });
      console.log("✓ MongoDB connected");
      return mongoose.connection;
    })().catch((err) => {
      // Reset so a later request can retry instead of being stuck on a
      // permanently-rejected promise.
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
