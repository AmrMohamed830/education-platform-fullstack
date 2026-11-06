'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import StudentView from './StudentView';
import AdminView from './AdminView';
import ProfileContent from '../../app/profile/ProfileContent';
import CoursesCatalogContent from '../../app/courses/CoursesCatalogContent';
import useAuthStore from '@/store/auth.store';

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = ['ADMIN', 'MANAGER'].includes(user?.role);

  return (
    <div className="min-h-screen flex bg-[var(--bg-main)]" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar
        role={isAdmin ? 'admin' : 'student'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 lg:mr-[270px] flex flex-col min-h-screen transition-all duration-300">
        {/* Dashboard Top Navbar */}
        <DashboardNavbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
        />

        {/* Dynamic Main Dashboard Content */}
        <main className="flex-1 p-5 sm:p-8 max-w-[1400px] w-full mx-auto">
          {activeTab === 'settings' && <ProfileContent initialTab="profile" />}
          {activeTab === 'certificates' && <ProfileContent initialTab="certificates" />}
          {activeTab === 'explore' && <CoursesCatalogContent />}
          {(activeTab === 'overview' || activeTab === 'my-courses') && !isAdmin && (
            <StudentView activeTab={activeTab} />
          )}
          {(activeTab === 'overview' || activeTab === 'courses-manage' || activeTab === 'students-manage') && isAdmin && (
            <AdminView activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}
