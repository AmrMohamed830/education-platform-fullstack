'use client';

import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import Badge from '../common/Badge';
import { featuresData } from '@/data/features';
import { Code, GraduationCap, Clock, Award, Users, Compass, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Code,
  GraduationCap,
  Clock,
  Award,
  Users,
  Compass,
};

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white border-t border-[var(--border-light)]">
      <Container>
        <SectionHeader
          badgeText="لماذا نتميز؟"
          badgeIcon={Sparkles}
          title="مميزات فريدة تضمن لك"
          highlightText="رحلة تعليمية ناجحة"
          subtitle="صممنا تجربتك التعليمية بعناية فائقة لتجمع بين المتعة، التطبيق العملي، والتفاعل المباشر."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Code;
            return (
              <div
                key={item.id}
                className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-light)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-right"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--border-light)] flex items-center justify-center text-[var(--primary)] shadow-sm">
                    <IconComponent size={26} />
                  </div>
                  <Badge variant="primary">{item.badge}</Badge>
                </div>
                <h3 className="text-xl font-extrabold text-[var(--text-main)] mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--text-body)] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
