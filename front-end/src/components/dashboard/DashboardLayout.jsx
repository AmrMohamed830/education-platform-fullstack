'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import StudentView from './StudentView';
import AdminView from './AdminView';
import { studentDashboardData, adminDashboardData } from '@/data/dashboardData';
import styles from './DashboardLayout.module.css';

export default function  DashboardLayout() {
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentUser = role === 'admin' ? adminDashboardData.user : studentDashboardData.user;

  return (
    <div className={styles.wrapper}>
      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Dashboard Top Navbar */}
        <DashboardNavbar
          role={role}
          setRole={(newRole) => {
            setRole(newRole);
            setActiveTab('overview');
          }}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={currentUser}
        />

        {/* Dynamic Main Dashboard Content */}
        <main className={styles.contentArea}>
          {role === 'admin' ? <AdminView /> : <StudentView />}
        </main>
      </div>
    </div>
  );
}
