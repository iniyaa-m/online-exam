require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/Student");
const Exam = require("./models/Exam");

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online_exam_lld";
  await mongoose.connect(uri);

  await Student.deleteMany({ studentId: "STU101" });
  await Exam.deleteMany({ examId: "EX101" });

  await Student.create({
    studentId: "STU101",
    name: "Demo Student",
    email: "student@example.com"
  });

  await Exam.create({
    examId: "EX101",
    title: "Computer Networks Fundamentals",
    subject: "Computer Networks",
    durationMinutes: 30,
    isPublished: true,
    startsAt: new Date(Date.now() - 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: [
      {
        questionId: "Q101",
        text: "Which layer is responsible for routing packets?",
        options: {
          A: "Application layer",
          B: "Network layer",
          C: "Transport layer",
          D: "Physical layer"
        },
        correctOption: "B",
        marks: 2
      },
      {
        questionId: "Q102",
        text: "Which protocol provides reliable, connection-oriented delivery?",
        options: {
          A: "UDP",
          B: "IP",
          C: "TCP",
          D: "ARP"
        },
        correctOption: "C",
        marks: 2
      },
      {
        questionId: "Q103",
        text: "How many bits are in an IPv4 address?",
        options: {
          A: "16",
          B: "32",
          C: "64",
          D: "128"
        },
        correctOption: "B",
        marks: 1
      }
    ]
  });

  console.log("Seed complete.");
  console.log("Demo student: STU101");
  console.log("Demo exam: EX101");
  console.log("Questions: Q101, Q102, Q103");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
