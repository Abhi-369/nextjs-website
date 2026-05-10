import mongoose, {Mongoose} from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable.");
}
console.log(MONGODB_URI, "url che")
type MongooseCache = {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
};

// Reuse the same cached connection across hot reloads in development.
const globalWithMongoose = globalThis as typeof globalThis & {
    mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!globalWithMongoose.mongooseCache) {
    globalWithMongoose.mongooseCache = cached;
}
console.log("kbhai")

async function connectToDatabase(): Promise<Mongoose> {
    // Return an existing open connection when available.
    if (cached.conn) {
        return cached.conn;
    }

    // Create a single in-flight connection promise to avoid duplicate connects.
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {bufferCommands: false})
            .then((mongooseInstance) => mongooseInstance);
    }

    try {
        cached.conn = await cached.promise;
        console.log("connect bhai")
    } catch (error) {
        // Reset promise so later calls can retry after a failed connection.
        cached.promise = null;
        throw error;
        console.log("didn't connect bhai")
    }

    return cached.conn;
}

export default connectToDatabase;
