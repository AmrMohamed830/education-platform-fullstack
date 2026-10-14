"use client";

import { useState, useEffect } from "react";
import { BookOpen, Menu, User, ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Container from "../common/Container";
import Button from "../common/Button";
import MobileMenu from "./MobileMenu";
import styles from "./Navbar.module.css";
import useAuthStore from "../../store/auth.store";

const NAV_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "لماذا نحن؟", href: "/#features" },
  { label: "المجالات", href: "/#categories" },
  { label: "الكورسات", href: "/#courses" },
  { label: "آراء الطلاب", href: "/#testimonials" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <Container>
          <div className={styles.navbarContainer}>
            {/* Brand Logo */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <BookOpen size={22} color="#FFFFFF" />
              </div>
              <div className={styles.logoText}>
                <span className={styles.brandTitle}>مَنصّتِي</span>
                <span className={styles.brandSubtitle}>المنصة التعليمية</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className={styles.desktopNav}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className={styles.actions}>
              {!isLoading && !user && (
                <>
                  <Link href="/login" style={{ textDecoration: "none" }}>
                    <Button
                      variant="ghost"
                      icon={User}
                      iconPosition="start"
                      className={styles.loginBtn}
                    >
                      تسجيل الدخول
                    </Button>
                  </Link>

                  <Link href="/register" style={{ textDecoration: "none" }}>
                    <Button
                      variant="primary"
                      icon={ArrowLeft}
                      className={styles.registerBtn}
                    >
                      ابدأ التعلم
                    </Button>
                  </Link>
                </>
              )}

              {!isLoading && user && (
                <Link
                  href="/dashboard"
                  className={styles.userProfileBtn}
                  title="الانتقال إلى لوحة التحكم"
                >
                  <div className={styles.userAvatarWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || "مستخدم"
                        )}&background=4F46E5&color=fff&bold=true`
                      }
                      alt={user.name || "المستخدم"}
                      className={styles.userAvatarImg}
                    />
                    <span className={styles.onlineStatus}></span>
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span
                      className={`${styles.userRole} ${
                        ["ADMIN", "MANAGER"].includes(user.role)
                          ? styles.adminRole
                          : styles.studentRole
                      }`}
                    >
                      {["ADMIN", "MANAGER"].includes(user.role)
                        ? "مشرف"
                        : "طالب"}
                    </span>
                  </div>
                  <div className={styles.dashboardIconWrapper}>
                    <LayoutDashboard size={16} className={styles.dashboardIcon} />
                  </div>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className={styles.mobileToggle}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="القائمة الرئيسية"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
