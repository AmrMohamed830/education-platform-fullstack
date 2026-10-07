import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import CourseCategories from '@/components/home/CourseCategories';
import Courses from '@/components/home/Courses';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <CourseCategories />
      <Courses />
      <Stats />
      <Testimonials />
      <CallToAction />
    </>
  );
}
