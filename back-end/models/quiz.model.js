const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, "نص السؤال مطلوب"],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: "يجب توفير خيارين على الأقل لكل سؤال",
    },
    required: true,
  },
  correctOptionIndex: {
    type: Number,
    required: [true, "تحديد الإجابة الصحيحة مطلوب"],
    min: 0,
  },
  points: {
    type: Number,
    default: 10,
    min: 1,
  },
  explanation: {
    type: String,
    default: "",
    trim: true,
  },
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "عنوان الاختبار مطلوب"],
      trim: true,
      default: "الاختبار النهائي للدورة",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    passingScore: {
      type: Number,
      required: true,
      default: 70, // Percentage e.g. 70%
      min: 10,
      max: 100,
    },
    timeLimit: {
      type: Number,
      default: 20, // in minutes (0 means unlimited)
      min: 0,
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;

