'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { AdminDashboardContent } from '@/components/features/admin/admin-dashboard-content';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 lg:ml-64">
        <AdminDashboardContent activeTab={activeTab} />
      </div>
    </div>
  );
}
