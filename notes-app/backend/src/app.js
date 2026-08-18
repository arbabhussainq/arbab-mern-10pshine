require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");
const logger = require("./config/logger");
const tagsRoutes = require("./routes/tagsRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/health", (req, res) => {
  console.log("health route reached");
  const healthCheck = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };
  try {
    // Optional: Add database or external service checks here if needed
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = "DOWN";
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/tags", tagsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Notes App API is running!" });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
