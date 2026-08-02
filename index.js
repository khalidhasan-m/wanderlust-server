import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5050;
const uri = process.env.MONGODB_URI;

// --------------------
// CORS
// --------------------

const allowedOrigins = [
  "http://localhost:3000",
  "https://wanderlust-seven-gules.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
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

app.options("*", cors());

app.use(express.json());

// --------------------
// MongoDB Connection
// --------------------

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

  cachedClient = client;

  console.log("MongoDB Connected");

  return cachedClient;
}

// --------------------
// Root
// --------------------

app.get("/", (req, res) => {
  res.json({
    message: "Wanderlust Server Running",
  });
});

// --------------------
// User Profile
// --------------------

app.get("/user/profile", requireAuth, async (req, res) => {
  res.json(req.user);
});

// --------------------
// Destination Routes
// --------------------

app.get("/destination", async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const destinations = await db.collection("destinations").find().toArray();

    res.json(destinations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.get("/destination/:id", async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const destination = await db.collection("destinations").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(destination);
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

    const data = {
      ...req.body,
      userId: req.user.id,
    };

    const result = await db.collection("destinations").insertOne(data);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.patch("/destination/:id", requireAuth, async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const result = await db.collection("destinations").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },

      {
        $set: req.body,
      },
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.delete("/destination/:id", requireAuth, async (req, res) => {
  try {
    const client = await connectDB();

    const db = client.db("wanderlust");

    const result = await db.collection("destinations").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});

// --------------------
// Booking Routes
// --------------------

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
    console.error(error);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

// User based booking

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
    console.error(error);

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

// --------------------
// Local Development
// --------------------

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

// Vercel Serverless

export default app;
