import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";

let cachedClient = null;
let cachedDb = null;

async function getAuth() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);

    await cachedClient.connect();

    cachedDb = cachedClient.db("wanderlust");
  }

  return betterAuth({
    database: mongodbAdapter(cachedDb, {
      client: cachedClient,
    }),

    secret: process.env.BETTER_AUTH_SECRET,

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    trustedOrigins: [process.env.FRONT_END_URL || "http://localhost:3000"],
  });
}

const requireAuth = async (req, res, next) => {
  try {
    const auth = await getAuth();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    req.user = session.user;

    next();
  } catch (error) {
    console.error("Auth Error:", error);

    res.status(401).json({
      error: "Unauthorized",
    });
  }
};

export { requireAuth, getAuth };
