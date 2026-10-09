const express = require("express");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");
const router = express.Router();

function studentIdFrom(req) {
  // Demo only. Replace this header-based identity with JWT/session authentication in production.
  return String(req.header("x-student-id") || "").trim();
}

async function getOwnedAttempt(attemptId, studentId) {
  return Attempt.findOne({ attemptId, studentId });
}

// POST /api/v1/attempts/:attemptId/answers is not used; save answer uses PUT below.
router.put("/:attemptId/answers/:questionId", async (req, res, next) => {
  try {
    const studentId = studentIdFrom(req);
    if (!studentId) return res.status(401).json({ error: "Send x-student-id header" });

    const { selectedOption } = req.body;
    if (!["A", "B", "C", "D"].includes(selectedOption)) {
      return res.status(400).json({ error: "selectedOption must be A, B, C or D" });
    }

    const attempt = await getOwnedAttempt(req.params.attemptId, studentId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found for this student" });
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(409).json({ error: "This attempt is already submitted" });
    }
    if (new Date() > attempt.deadlineAt) {
      return res.status(409).json({ error: "Exam deadline passed. Submit is no longer allowed." });
    }

    const exam = await Exam.findOne({ examId: attempt.examId });
    const questionExists = exam && exam.questions.some(q => q.questionId === req.params.questionId);
    if (!questionExists) return res.status(404).json({ error: "Question not found in this exam" });

    const existing = attempt.answers.find(a => a.questionId === req.params.questionId);
    if (existing) existing.selectedOption = selectedOption;
    else attempt.answers.push({ questionId: req.params.questionId, selectedOption });

    await attempt.save();
    res.json({
      attemptId: attempt.attemptId,
      questionId: req.params.questionId,
      selectedOption,
      message: "Answer saved"
    });
  } catch (err) { next(err); }
});

// POST /api/v1/attempts/:attemptId/submit - submit and evaluate
router.post("/:attemptId/submit", async (req, res, next) => {
  try {
    const studentId = studentIdFrom(req);
    if (!studentId) return res.status(401).json({ error: "Send x-student-id header" });

    const attempt = await getOwnedAttempt(req.params.attemptId, studentId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found for this student" });
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(409).json({ error: "Attempt has already been submitted", status: attempt.status });
    }
    if (new Date() > attempt.deadlineAt) {
      return res.status(409).json({ error: "Exam deadline passed. This demo does not allow late submission." });
    }

    const exam = await Exam.findOne({ examId: attempt.examId });
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // Mark submitted before returning. Missing answers count as incorrect.
    const answerMap = new Map(attempt.answers.map(a => [a.questionId, a.selectedOption]));
    let marks = 0;
    const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);

    for (const q of exam.questions) {
      if (answerMap.get(q.questionId) === q.correctOption) marks += q.marks;
    }

    attempt.status = "EVALUATED";
    attempt.submittedAt = new Date();
    attempt.marksObtained = marks;
    attempt.totalMarks = totalMarks;
    await attempt.save();

    res.status(200).json({
      attemptId: attempt.attemptId,
      status: "SUBMITTED",
      message: "Exam submitted and evaluated successfully",
      resultStatus: "PUBLISHED",
      marksObtained: marks,
      totalMarks
    });
  } catch (err) { next(err); }
});

// GET /api/v1/attempts/:attemptId/result - only the owning student can read the result
router.get("/:attemptId/result", async (req, res, next) => {
  try {
    const studentId = studentIdFrom(req);
    if (!studentId) return res.status(401).json({ error: "Send x-student-id header" });

    const attempt = await getOwnedAttempt(req.params.attemptId, studentId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found for this student" });
    if (attempt.status !== "EVALUATED") {
      return res.status(409).json({ error: "Result is not available yet", status: attempt.status });
    }

    res.json({
      attemptId: attempt.attemptId,
      studentId: attempt.studentId,
      examId: attempt.examId,
      marksObtained: attempt.marksObtained,
      totalMarks: attempt.totalMarks,
      status: "PUBLISHED",
      submittedAt: attempt.submittedAt
    });
  } catch (err) { next(err); }
});

module.exports = router;
