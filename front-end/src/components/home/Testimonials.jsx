'use client';

import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import StarRating from '../common/StarRating';
import { testimonialsData } from '@/data/testimonials';
import { MessageSquare, Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-[var(--bg-main)]">
      <Container>
        <SectionHeader
          badgeText="قصص نجاح"
          badgeIcon={MessageSquare}
          title="ماذا يقول خريجونا عن"
          highlightText="تجرِبتهم التعليمية؟"
          subtitle="قصص واقعية لطلاب تحول شغفهم بالتقنية إلى فرص عمل حقيقية وتطور مهني ملموس."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[var(--border-light)] rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-right"
            >
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold flex items-center justify-center shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-[var(--text-main)]">{item.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{item.role}</p>
                </div>
                <Quote size={32} className="text-slate-200 absolute left-0 top-0" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <StarRating rating={item.rating} />
                <span className="text-xs font-semibold py-1 px-2.5 rounded-md bg-slate-100 text-[var(--text-muted)]">
                  {item.courseTaken}
                </span>
              </div>

              <p className="text-sm text-[var(--text-body)] leading-relaxed italic flex-1">
                &ldquo;{item.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
