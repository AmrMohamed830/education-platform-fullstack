const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/auth.model");
const Course = require("./models/course.model");
const Quiz = require("./models/quiz.model");
const Review = require("./models/review.model");
const Enrollment = require("./models/enrollment.model");
const userRoles = require("./utils/userRoles");

const MONGO_URL = process.env.MONGO_URL;

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URL);
    console.log("Connected successfully!");

    // 1. Create Demo Users
    console.log("Seeding Demo Users...");
    const adminPassword = await bcrypt.hash("admin123456", 10);
    const studentPassword = await bcrypt.hash("student123456", 10);

    let admin = await User.findOne({ email: "admin@platform.com" });
    if (!admin) {
      admin = await User.create({
        name: "المهندس أحمد (مدير المنصة)",
        email: "admin@platform.com",
        password: adminPassword,
        role: userRoles.ADMIN,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      });
      console.log("Created Admin: admin@platform.com / admin123456");
    } else {
      admin.role = userRoles.ADMIN;
      admin.password = adminPassword;
      await admin.save();
      console.log("Updated Admin: admin@platform.com / admin123456");
    }

    let student = await User.findOne({ email: "student@platform.com" });
    if (!student) {
      student = await User.create({
        name: "عمر خالد (طالب تجريبي)",
        email: "student@platform.com",
        password: studentPassword,
        role: userRoles.USER,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      });
      console.log("Created Student: student@platform.com / student123456");
    } else {
      student.password = studentPassword;
      await student.save();
      console.log("Updated Student: student@platform.com / student123456");
    }

    // 2. Seed Realistic Courses if DB has fewer than 2 courses
    const existingCoursesCount = await Course.countDocuments();
    if (existingCoursesCount < 2) {
      console.log("Seeding Courses...");

      const course1 = await Course.create({
        title: "دبلومة Full-Stack JavaScript & React الحديثة",
        description:
          "المسار المتكامل الشامل لتعلم جافاسكريبت الحديثة، رياكت، نود جي اس، مونجو دي بي، وبناء تطبيقات ويب حقيقية جاهزة للعمل في كبرى الشركات.",
        instructor: "م. إسلام هشام",
        category: "تطوير الويب",
        price: 0,
        status: "active",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
        sections: [
          {
            title: "الوحدة 1: الأساسيات الحديثة ومعمارية الويب",
            order: 0,
            lessons: [
              {
                title: "مقدمة المسار وخارطة الطريق لاحتراف Full-Stack",
                description: "نظرة عامة على أدوات التطوير وما سنقوم ببنائه خطوة بخطوة.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 15,
                isPreview: true,
                order: 0,
              },
              {
                title: "مفاهيم JavaScript الحديثة (ES6+ & Async/Await)",
                description: "التعامل المتقدم مع Promises و Destructuring وتوابع المصفوفات.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 25,
                isPreview: false,
                order: 1,
              },
            ],
          },
          {
            title: "الوحدة 2: بناء واجهات تفاعلية متقدمة بـ React",
            order: 1,
            lessons: [
              {
                title: "هندسة المكونات وإدارة الحالة (Component Architecture)",
                description: "تنظيم الكومبوننت واستخدام Hooks بكفاءة عالية.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 35,
                isPreview: false,
                order: 0,
              },
              {
                title: "الربط مع الـ APIs والتعامل مع Server State",
                description: "استخدام Axios و TanStack Query لجلب البيانات والتعامل مع الكاش.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 40,
                isPreview: false,
                order: 1,
              },
            ],
          },
        ],
      });

      const course2 = await Course.create({
        title: "احتراف Next.js 16 مع TanStack Query و Tailwind",
        description:
          "تعلم بناء تطبيقات ويب سريعة جداً ومحسنة لمحركات البحث (SEO) باستخدام أحدث إصدار من Next.js وميزات App Router و Server Components.",
        instructor: "م. طارق علي",
        category: "تطوير الويب",
        price: 49,
        status: "active",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        sections: [
          {
            title: "مقدمة وإعداد بيئة العمل في Next.js 16",
            order: 0,
            lessons: [
              {
                title: "هيكل المشروع ومعمارية App Router",
                description: "فهم كيفية عمل Layouts و Pages والمجلدات الديناميكية.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 20,
                isPreview: true,
                order: 0,
              },
            ],
          },
        ],
      });

      console.log("Courses seeded successfully!");
    }

    // 3. Ensure Course Quizzes exist
    console.log("Checking and Seeding Quizzes...");
    const courses = await Course.find();
    for (const course of courses) {
      let quiz = await Quiz.findOne({ course: course._id });
      if (!quiz) {
        await Quiz.create({
          course: course._id,
          title: `الاختبار النهائي لدورة: ${course.title}`,
          description: "اختبار تقييمي لقياس فهمك لأهم المفاهيم النظرية والتطبيقية في هذا المسار.",
          passingScore: 70,
          timeLimit: 15,
          isActive: true,
          questions: [
            {
              questionText: "ما هي الفائدة الأساسية من استخدام Server Components في Next.js؟",
              options: [
                "تقليل حجم حزمة الجافاسكريبت المرسلة للمتصفح وتحسين أداء الـ SEO",
                "إمكانية استخدام useState و useEffect مباشرة داخل السيرفر",
                "جعل جميع العمليات تعتمد على المتصفح فقط",
                "منع الاتصال بقواعد البيانات مباشرة",
              ],
              correctOptionIndex: 0,
              points: 10,
              explanation: "تعمل Server Components على تقليل كود الجافاسكريبت العميل وتسريع سرعة تحميل الصفحات.",
            },
            {
              questionText: "لماذا نستخدم مكتبة TanStack Query لإدارة Server State؟",
              options: [
                "لكتابة كود CSS بشكل أسهل",
                "لإدارة الكاش والتحديث التلقائي والتعامل مع حالات التحميل والخطأ بذكاء",
                "لاستبدال قواعد بيانات MongoDB بالكامل",
                "لإنشاء مسارات التوجيه في السيرفر",
              ],
              correctOptionIndex: 1,
              points: 10,
              explanation: "TanStack Query ممتازة في الكاش التلقائي وتفادي تكرار طلبات الـ HTTP وإعادة التحميل الذكي.",
            },
            {
              questionText: "ما هو الغرض من استخدام خاصية `withCredentials: true` في Axios؟",
              options: [
                "تشفير كلمات المرور داخل قاعدة البيانات",
                "السماح بإرسال واستقبال الكوكيز (Cookies) عبر الطلبات بين الفرونت والباك",
                "تحويل النصوص إلى حروف كبيرة تلقائياً",
                "ضغط حجم الصور المرفوعة",
              ],
              correctOptionIndex: 1,
              points: 10,
              explanation: "خاصية withCredentials تسمح للـ AJAX بإرسال كوكيز المصادقة الموثقة بين الدومينات.",
            },
          ],
        });
        console.log(`Quiz created for course: ${course.title}`);
      }
    }

    console.log("────────────────────────────────────────────────");
    console.log("✅ Database seeding completed successfully!");
    console.log("Admin Demo Credentials:  admin@platform.com  / admin123456");
    console.log("Student Demo Credentials: student@platform.com / student123456");
    console.log("────────────────────────────────────────────────");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding database:", err);
    process.exit(1);
  }
}

seed();
