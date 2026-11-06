const mongoose = require("mongoose");
const Quiz = require("../models/quiz.model");
const QuizAttempt = require("../models/quizAttempt.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const userRoles = require("../utils/userRoles");

// ── 1. Get Quiz for a Course ──────────────────────────────────────────
const getCourseQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const currentUser = req.currentUser;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return res.status(200).json({
        status: "success",
        data: { quiz: null },
      });
    }

    const isAdmin =
      currentUser && [userRoles.ADMIN, userRoles.MANAGER].includes(currentUser.role);

    // Get student's previous attempts if logged in
    let userAttempts = [];
    let bestAttempt = null;
    let latestAttempt = null;

    if (currentUser) {
      userAttempts = await QuizAttempt.find({
        user: currentUser._id,
        quiz: quiz._id,
      }).sort({ createdAt: -1 });

      if (userAttempts.length > 0) {
        latestAttempt = userAttempts[0];
        bestAttempt = [...userAttempts].sort((a, b) => b.score - a.score)[0];
      }
    }

    // Hide answers from active students unless they are admin
    const questions = quiz.questions.map((q) => {
      const qObj = q.toObject();
      if (!isAdmin) {
        delete qObj.correctOptionIndex;
        delete qObj.explanation;
      }
      return qObj;
    });

    return res.status(200).json({
      status: "success",
      data: {
        quiz: {
          _id: quiz._id,
          course: quiz.course,
          title: quiz.title,
          description: quiz.description,
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit,
          questionsCount: quiz.questions.length,
          questions,
          isActive: quiz.isActive,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        },
        attempts: userAttempts,
        bestAttempt,
        latestAttempt,
        hasPassed: Boolean(bestAttempt?.passed),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. Create or Update Quiz (Admin / Manager) ────────────────────────
const upsertCourseQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, passingScore, timeLimit, questions, isActive } = req.body;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: "fail", message: "الكورس غير موجود" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "يجب إضافة سؤال واحد على الأقل للاختبار",
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({
          status: "fail",
          message: `نص السؤال رقم ${i + 1} مطلوب`,
        });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({
          status: "fail",
          message: `السؤال رقم ${i + 1} يجب أن يحتوي على خيارين على الأقل`,
        });
      }
      if (
        q.correctOptionIndex === undefined ||
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length
      ) {
        return res.status(400).json({
          status: "fail",
          message: `الإجابة الصحيحة للسؤال رقم ${i + 1} غير صالحة`,
        });
      }
    }

    let quiz = await Quiz.findOne({ course: courseId });

    if (quiz) {
      // Update existing
      quiz.title = title ? title.trim() : quiz.title;
      quiz.description = description !== undefined ? description.trim() : quiz.description;
      quiz.passingScore = Number(passingScore) || quiz.passingScore;
      quiz.timeLimit = timeLimit !== undefined ? Number(timeLimit) : quiz.timeLimit;
      quiz.questions = questions;
      if (isActive !== undefined) quiz.isActive = Boolean(isActive);

      await quiz.save();
    } else {
      // Create new
      quiz = await Quiz.create({
        course: courseId,
        title: title ? title.trim() : "الاختبار النهائي للدورة",
        description: description ? description.trim() : "",
        passingScore: Number(passingScore) || 70,
        timeLimit: timeLimit !== undefined ? Number(timeLimit) : 20,
        questions,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "تم حفظ الاختبار بنجاح 🎉",
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. Submit Quiz Attempt (Student) ──────────────────────────────────
const submitQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.currentUser._id;
    const { answers } = req.body;
    // answers: [ { questionId: "...", selectedOption: 1 } ]

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    // Verify student is enrolled (or admin)
    const isPrivileged = [userRoles.ADMIN, userRoles.MANAGER].includes(req.currentUser.role);
    if (!isPrivileged) {
      const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
      if (!enrollment) {
        return res.status(403).json({
          status: "fail",
          message: "يجب التسجيل في الكورس أولاً لتقديم الاختبار",
        });
      }
    }

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        status: "fail",
        message: "الاختبار غير متاح حالياً",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        status: "fail",
        message: "بيانات الإجابات غير صالحة",
      });
    }

    // Grading logic
    let earnedPoints = 0;
    let totalPoints = 0;
    const answersMap = new Map();

    answers.forEach((ans) => {
      if (ans.questionId) {
        answersMap.set(String(ans.questionId), Number(ans.selectedOption));
      }
    });

    const evaluatedAnswers = [];
    const questionResults = [];

    quiz.questions.forEach((question) => {
      const qId = String(question._id);
      const points = question.points || 10;
      totalPoints += points;

      const studentSelected = answersMap.has(qId) ? answersMap.get(qId) : -1;
      const isCorrect = studentSelected === question.correctOptionIndex;

      if (isCorrect) {
        earnedPoints += points;
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOption: studentSelected,
        isCorrect,
      });

      questionResults.push({
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        selectedOption: studentSelected,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        points,
        explanation: question.explanation || "",
      });
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Count past attempts
    const previousAttemptsCount = await QuizAttempt.countDocuments({
      user: userId,
      quiz: quiz._id,
    });

    const attempt = await QuizAttempt.create({
      user: userId,
      quiz: quiz._id,
      course: courseId,
      answers: evaluatedAnswers,
      score,
      earnedPoints,
      totalPoints,
      passed,
      attemptNumber: previousAttemptsCount + 1,
      completedAt: new Date(),
    });

    return res.status(200).json({
      status: "success",
      message: passed
        ? "تهانينا! لقد اجتزت الاختبار بنجاح 🎉"
        : "للأسف لم تحقق درجة النجاح المطلوبة، يمكنك المحاولة مرة أخرى.",
      data: {
        attempt: {
          _id: attempt._id,
          score,
          earnedPoints,
          totalPoints,
          passed,
          passingScore: quiz.passingScore,
          attemptNumber: attempt.attemptNumber,
          completedAt: attempt.completedAt,
        },
        questionResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 4. Get Student's All Past Quiz Attempts ───────────────────────────
const getMyAttempts = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;

    const attempts = await QuizAttempt.find({ user: userId })
      .populate("course", "title category instructor image price")
      .populate("quiz", "title passingScore")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      results: attempts.length,
      data: { attempts },
    });
  } catch (error) {
    next(error);
  }
};

// ── 5. Get Quiz Attempts for Specific Course ──────────────────────────
const getCourseAttempts = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.currentUser._id;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    const attempts = await QuizAttempt.find({
      user: userId,
      course: courseId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      results: attempts.length,
      data: { attempts },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseQuiz,
  upsertCourseQuiz,
  submitQuiz,
  getMyAttempts,
  getCourseAttempts,
};

