require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const examRoutes = require("./routes/exams");
const attemptRoutes = require("./routes/attempts");
const examAttemptRoutes = require("./routes/examAttempts");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Online Examination System API is running",
    version: "v1",
    endpoints: [
      "GET /api/v1/exams",
      "GET /api/v1/exams/:examId/questions",
      "POST /api/v1/exams/:examId/attempts",
      "PUT /api/v1/attempts/:attemptId/answers/:questionId",
      "POST /api/v1/attempts/:attemptId/submit",
      "GET /api/v1/attempts/:attemptId/result"
    ]
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/exams", examAttemptRoutes);
app.use("/api/v1/attempts", attemptRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online_exam_lld";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB.");
    console.error("Check that MongoDB is installed/running and MONGO_URI in .env is correct.");
    console.error(error.message);
    process.exit(1);
  });
