'use client';

import Container from '../common/Container';
import { statsData } from '@/data/stats';

export default function Stats() {
  return (
    <section className="py-12 bg-white">
      <Container>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {statsData.map((stat) => (
              <div key={stat.id} className="flex flex-col items-center">
                <span className="text-3xl lg:text-4xl font-black mb-2 font-mono gradient-text">
                  {stat.value}
                </span>
                <h3 className="text-base font-bold text-slate-200 mb-1">{stat.label}</h3>
                <p className="text-xs text-slate-400">{stat.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
