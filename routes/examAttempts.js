const express = require("express");
const { randomUUID } = require("crypto");
const Exam = require("../models/Exam");
const Student = require("../models/Student");
const Attempt = require("../models/Attempt");
const router = express.Router();

router.post("/:examId/attempts", async (req, res, next) => {
  try {
    const studentId = String(req.header("x-student-id") || "").trim();
    if (!studentId) return res.status(401).json({ error: "Send x-student-id header" });

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found. Run npm run seed." });

    const now = new Date();
    const exam = await Exam.findOne({
      examId: req.params.examId,
      isPublished: true,
      startsAt: { $lte: now },
      endsAt: { $gt: now }
    });
    if (!exam) return res.status(404).json({ error: "Exam not found or unavailable" });

    const alreadyActive = await Attempt.findOne({
      studentId, examId: exam.examId, status: "IN_PROGRESS"
    });
    if (alreadyActive) {
      return res.status(409).json({
        error: "An active attempt already exists",
        attemptId: alreadyActive.attemptId
      });
    }

    const startedAt = new Date();
    const examDeadline = new Date(startedAt.getTime() + exam.durationMinutes * 60 * 1000);
    const deadlineAt = examDeadline < exam.endsAt ? examDeadline : exam.endsAt;

    const attempt = await Attempt.create({
      attemptId: `ATT-${randomUUID()}`,
      studentId,
      examId: exam.examId,
      startedAt,
      deadlineAt,
      totalMarks: exam.questions.reduce((sum, q) => sum + q.marks, 0),
      answers: []
    });

    res.status(201).json({
      attemptId: attempt.attemptId,
      studentId,
      examId: exam.examId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      durationMinutes: exam.durationMinutes
    });
  } catch (err) { next(err); }
});

module.exports = router;
