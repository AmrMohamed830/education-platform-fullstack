const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOption: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true, // percentage: e.g. 85
      min: 0,
      max: 100,
    },
    earnedPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ user: 1, course: 1, createdAt: -1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = QuizAttempt;

