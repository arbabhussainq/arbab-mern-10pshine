require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");
const logger = require("./config/logger");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Notes App API is running!" });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
