'use client';

import Link from 'next/link';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import { categoriesData } from '@/data/categories';
import {
  Code2,
  BrainCircuit,
  Smartphone,
  Palette,
  ShieldCheck,
  Cloud,
  BookOpen,
  Users,
  ArrowLeft,
} from 'lucide-react';

const ICON_MAP = {
  Code2,
  BrainCircuit,
  Smartphone,
  Palette,
  ShieldCheck,
  Cloud,
};

export default function CourseCategories() {
  return (
    <section id="categories" className="py-20 bg-[var(--bg-main)]">
      <Container>
        <SectionHeader
          badgeText="المجالات التعليمية"
          badgeIcon={BookOpen}
          title="اختر تخصصك وابدأ"
          highlightText="رحلة الاحتراف والتطوير"
          subtitle="مسارات متكاملة مُصممة وفق أحدث المهارات المطلوبة في سوق العمل العربي والعالمي."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData.map((category) => {
            const IconComponent = ICON_MAP[category.icon] || Code2;
            return (
              <Link
                key={category.id}
                href="/courses"
                className="group w-full p-6 rounded-2xl bg-white border border-[var(--border-light)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-5 relative overflow-hidden text-right no-underline text-inherit"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm"
                  style={{ backgroundColor: category.color || '#4F46E5' }}
                >
                  <IconComponent size={28} />
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-extrabold text-[var(--text-main)] mb-1.5 group-hover:text-[var(--primary)] transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-semibold mt-auto">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} />
                      <span>{category.courseCount} دورة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      <span>{category.studentCount} طالب</span>
                    </div>
                  </div>
                </div>

                <div className="text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:-translate-x-1 transition-all self-center shrink-0">
                  <ArrowLeft size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
