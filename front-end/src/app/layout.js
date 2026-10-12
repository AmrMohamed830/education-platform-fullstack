import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/../providers/AuthProvider";

export const metadata = {
  title: "مَنصّتِي | المنصة التعليمية البرمجية التفاعلية",
  description:
    "المنصة التعليمية العربية المتقدمة لتعلم البرمجة، الذكاء الاصطناعي وتصميم الواجهات بمشاريع تفاعلية وإشراف مباشر من الخبراء.",
  keywords: [
    "منصة تعليمية",
    "تعلم البرمجة بالعربية",
    "كورس Next.js",
    "الذكاء الاصطناعي",
    "تصميم UI/UX",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
