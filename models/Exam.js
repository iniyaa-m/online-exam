const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  text: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctOption: { type: String, enum: ["A", "B", "C", "D"], required: true },
  marks: { type: Number, min: 0, default: 1 }
}, { _id: false });

const examSchema = new mongoose.Schema({
  examId: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  isPublished: { type: Boolean, default: true },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  questions: { type: [questionSchema], validate: v => v.length > 0 }
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
