const express = require("express");
const Exam = require("../models/Exam");
const router = express.Router();

// GET /api/v1/exams - list published exams currently within their availability window
router.get("/", async (req, res, next) => {
  try {
    const now = new Date();
    const exams = await Exam.find({
      isPublished: true,
      startsAt: { $lte: now },
      endsAt: { $gt: now }
    }).select("examId title subject durationMinutes startsAt endsAt questions");
    res.json({
      count: exams.length,
      exams: exams.map(e => ({
        examId: e.examId,
        title: e.title,
        subject: e.subject,
        durationMinutes: e.durationMinutes,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        questionCount: e.questions.length
      }))
    });
  } catch (err) { next(err); }
});

// GET /api/v1/exams/:examId/questions - never return correctOption
router.get("/:examId/questions", async (req, res, next) => {
  try {
    const exam = await Exam.findOne({
      examId: req.params.examId,
      isPublished: true,
      startsAt: { $lte: new Date() },
      endsAt: { $gt: new Date() }
    });
    if (!exam) return res.status(404).json({ error: "Exam not found or unavailable" });

    res.json({
      examId: exam.examId,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      questions: exam.questions.map(q => ({
        questionId: q.questionId,
        text: q.text,
        options: q.options,
        marks: q.marks
      }))
    });
  } catch (err) { next(err); }
});

module.exports = router;
