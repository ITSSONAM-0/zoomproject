import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import dotenv from "dotenv";

dotenv.config(); // ✅ important

const app = express();
const server = createServer(app);

// socket
connectToSocket(server);

// middlewares
app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// routes
app.use("/api/v1/users", userRoutes);

// start server
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MONGO Connected: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`SERVER RUNNING ON PORT ${app.get("port")} 🚀`);
    });

  } catch (error) {
    console.log("DB ERROR ❌", error.message);
  }
};

start();