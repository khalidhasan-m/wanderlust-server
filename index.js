const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { requireAuth } = require("./middleware/authMiddleware");

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5050;
const app = express();

// CORS configuration to allow cookies from Next.js
app.use(
  cors({
    origin: process.env.FRONT_END_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// MongoDB connection caching for Serverless (Vercel)
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
  console.log("Connected to Database!");
  return cachedClient;
}

// --- DEFINE ROUTES ---

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// PROFILE ROUTE
app.get("/user/profile", requireAuth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUBLIC ROUTES
app.get("/destination", async (req, res) => {
  try {
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db.collection("destinations").find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/destination/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db.collection("destinations").findOne({
      _id: new ObjectId(id),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PROTECTED ROUTES
app.post("/destination", requireAuth, async (req, res) => {
  try {
    const destinationData = req.body;
    destinationData.userId = req.user.id;
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db
      .collection("destinations")
      .insertOne(destinationData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/destination/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db
      .collection("destinations")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/destination/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db.collection("destinations").deleteOne({
      _id: new ObjectId(id),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/booking", requireAuth, async (req, res) => {
  try {
    const bookingData = req.body;
    bookingData.userId = req.user.id;
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db.collection("bookings").insertOne(bookingData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/booking/:userId", requireAuth, async (req, res) => {
  try {
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db
      .collection("bookings")
      .find({ userId: req.params.userId })
      .toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/booking/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await connectDB();
    const db = client.db("wanderlust");
    const result = await db.collection("bookings").deleteOne({
      _id: new ObjectId(id),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Conditional local listener / Vercel export
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
