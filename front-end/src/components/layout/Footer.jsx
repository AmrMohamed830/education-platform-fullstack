'use client';

import Container from '../common/Container';
import Button from '../common/Button';
import { BookOpen, Send, Mail, Phone, MapPin, Heart } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.topGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <a href="#" className={styles.logo}>
              <div className={styles.logoIcon}>
                <BookOpen size={24} color="#FFFFFF" />
              </div>
              <span className={styles.brandTitle}>مَنصّتِي</span>
            </a>
            <p className={styles.brandDesc}>
              المنصة التعليمية العربية المتقدمة لبناء مهارات المستقيل في مجالات البرمجة، الذكاء الاصطناعي والتصميم بخبرات عمليّة حقيقية.
            </p>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <Mail size={16} className={styles.contactIcon} />
                <span>support@platform.com</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} className={styles.contactIcon} />
                <span>+966 50 123 4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>روابط سريعة</h4>
            <ul className={styles.linkList}>
              <li><a href="#hero">الرئيسية</a></li>
              <li><a href="#features">لماذا نتميز؟</a></li>
              <li><a href="#categories">المجالات التعليمية</a></li>
              <li><a href="#courses">الكورسات المتاحة</a></li>
              <li><a href="#testimonials">قصص النجاح</a></li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>أبرز المسارات</h4>
            <ul className={styles.linkList}>
              <li><a href="#categories">تطوير الويب الكامل</a></li>
              <li><a href="#categories">الذكاء الاصطناعي</a></li>
              <li><a href="#categories">تصميم الواجهات UX/UI</a></li>
              <li><a href="#categories">تطوير الجوال</a></li>
              <li><a href="#categories">الأمن السيبراني</a></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>النشرة البريدية</h4>
            <p className={styles.newsletterDesc}>
              اشترك للحصول على أحدث المقالات والمقاعد المجانية في الدورات الجديدة.
            </p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className={styles.newsletterInput}
                required
              />
              <Button type="submit" variant="primary" size="sm" icon={Send} iconPosition="start">
                اشترك
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            جميع الحقوق محفوظة © 2026 مَنصّتِي التعليمية. صُنعت بـ <Heart size={14} className={styles.heartIcon} fill="#EC4899" color="#EC4899" /> للمتعلمين العرب.
          </p>
          <div className={styles.legalLinks}>
            <a href="#">الشروط والأحكام</a>
            <a href="#">سياسة الخصوصية</a>
            <a href="#">مركز المساعدة</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
