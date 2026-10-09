const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOption: { type: String, enum: ["A", "B", "C", "D"], required: true }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  examId: { type: String, required: true, index: true },
  answers: { type: [answerSchema], default: [] },
  status: { type: String, enum: ["IN_PROGRESS", "SUBMITTED", "EVALUATED"], default: "IN_PROGRESS" },
  startedAt: { type: Date, required: true },
  deadlineAt: { type: Date, required: true },
  submittedAt: { type: Date, default: null },
  marksObtained: { type: Number, default: null },
  totalMarks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);
