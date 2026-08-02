import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5050;
const uri = process.env.MONGODB_URI;

// =======================
// CORS CONFIG
// =======================

const allowedOrigins = [
  "http://localhost:3000",
  "https://wanderlust-seven-gules.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"));
    },

    credentials: true,

    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// =======================
// DATABASE
// =======================

let cachedClient = null;

async function connectDB() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  console.log("MongoDB Connected");

  cachedClient = client;

  return client;
}

// =======================
// ROOT
// =======================

app.get("/", (req, res) => {
  res.json({
    message: "Wanderlust Server Running",
  });
});

// =======================
// USER PROFILE
// =======================

app.get("/user/profile", requireAuth, (req, res) => {
  res.json(req.user);
});

// =======================
// DESTINATIONS
// =======================

app.get("/destination", async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const data = await db.collection("destinations").find().toArray();

    res.json(data);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.get("/destination/:id", async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const data = await db.collection("destinations").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.post("/destination", requireAuth, async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const destination = {
      ...req.body,

      userId: req.user.id,
    };

    const result = await db.collection("destinations").insertOne(destination);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});

// =======================
// BOOKING
// =======================

app.post("/booking", requireAuth, async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const booking = {
      ...req.body,

      userId: req.user.id,

      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    res.json(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.get("/booking/:userId", requireAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const client = await connectDB();

    const db = client.db("wanderlust");

    const bookings = await db
      .collection("bookings")
      .find({
        userId: req.params.userId,
      })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.delete("/booking/:id", requireAuth, async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const result = await db.collection("bookings").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});

// =======================
// LOCAL ONLY
// =======================

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;
