"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import StudentView from "./StudentView";
import AdminView from "./AdminView";
import styles from "./DashboardLayout.module.css";
import useAuthStore from "@/store/auth.store";

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = ["ADMIN", "MANAGER"].includes(user?.role);

  return (
    <div className={styles.wrapper}>
      {/* Sidebar Navigation */}
      <Sidebar
        role={isAdmin ? "admin" : "student"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Dashboard Top Navbar */}
        <DashboardNavbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
        />

        {/* Dynamic Main Dashboard Content */}
        <main className={styles.contentArea}>
          {isAdmin ? <AdminView /> : <StudentView />}
        </main>
      </div>
    </div>
  );
}
