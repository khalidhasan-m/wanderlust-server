# 🌍 Wanderlust Backend Server

The **Wanderlust Backend Server** is a **Node.js** and **Express.js** REST API that powers the **Wanderlust** travel platform. It manages destinations, user bookings, and secure user authentication using **Better Auth** and **MongoDB**.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Native Driver)
- **Authentication:** Better Auth (`@better-auth/mongo-adapter`)
- **Deployment:** Vercel (Serverless Functions)

---

## 📁 Project Structure

```text
├── middleware/
│   └── authMiddleware.js      # Better Auth session validation middleware
├── .env                       # Environment variables
├── .gitignore                 # Ignored files and folders
├── index.js                   # Main server entry point
├── package.json               # Project dependencies and scripts
├── README.md                  # Project documentation
└── vercel.json                # Vercel serverless configuration
```

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-backend-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
PORT=5050
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
FRONT_END_URL=http://localhost:3000
```

---

### 4. Start the Development Server

```bash
node index.js
```

If you use **nodemon**, run:

```bash
npm run dev
```

---

## 🌐 API Endpoints

### Public Routes

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| GET    | `/`                | Health check (`Hello World!`) |
| GET    | `/destination`     | Get all destinations          |
| GET    | `/destination/:id` | Get a destination by its ID   |

---

### Protected Routes

> Authentication is required. Requests must include a valid Better Auth session cookie.

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/user/profile`    | Get the authenticated user's profile |
| POST   | `/destination`     | Create a new destination             |
| PATCH  | `/destination/:id` | Update an existing destination       |
| DELETE | `/destination/:id` | Delete a destination                 |
| POST   | `/booking`         | Create a booking                     |
| GET    | `/booking/:userId` | Get bookings for a specific user     |
| DELETE | `/booking/:id`     | Delete a booking                     |

---

## 🔐 Authentication

Authentication is handled using **Better Auth** with MongoDB session storage.

Protected routes require:

- A valid authenticated session.
- Session cookies sent with the request (`credentials: "include"`).

---

## 📦 Environment Variables

| Variable             | Description                    |
| -------------------- | ------------------------------ |
| `PORT`               | Server port                    |
| `MONGODB_URI`        | MongoDB connection string      |
| `BETTER_AUTH_SECRET` | Secret key used by Better Auth |
| `BETTER_AUTH_URL`    | Backend authentication URL     |
| `FRONT_END_URL`      | Frontend application URL       |

---

## 🚀 Deployment

This project is configured for deployment on **Vercel** using Serverless Functions.

Before deploying, make sure all required environment variables are configured in the Vercel dashboard.

---

## 📄 License

This project is intended for educational and personal portfolio purposes.
