import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;
let cachedAuth = null;

async function getAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);

    await cachedClient.connect();

    cachedDb = cachedClient.db("wanderlust");
  }

  cachedAuth = betterAuth({
    database: mongodbAdapter(cachedDb, {
      client: cachedClient,
    }),

    secret: process.env.BETTER_AUTH_SECRET,

    baseURL: process.env.BETTER_AUTH_URL,

    trustedOrigins: [process.env.FRONT_END_URL],
  });

  return cachedAuth;
}

const requireAuth = async (req, res, next) => {
  try {
    const auth = await getAuth();

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    console.log("TOKEN:", token);

    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    console.log("SESSION:", session);

    if (!session?.user) {
      return res.status(401).json({
        error: "Invalid session",
      });
    }

    req.user = session.user;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};

export { requireAuth, getAuth };
