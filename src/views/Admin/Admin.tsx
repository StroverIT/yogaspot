import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { AdminHeader } from './components/AdminHeader';
import { AdminSectionNav } from './components/AdminSectionNav';
import { AdminOverview } from './sections/AdminOverview';
import { AdminReviewsSection } from './sections/AdminReviewsSection';
import { AdminStudiosSection } from './sections/AdminStudiosSection';
import { AdminUsersSection } from './sections/AdminUsersSection';
import type { AdminSectionKey } from './types';

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSectionKey>('overview');

  return (
    <div className="min-h-screen">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <AdminSectionNav activeSection={activeSection} onSectionChange={setActiveSection} />

        {activeSection === 'overview' && <AdminOverview />}
        {activeSection === 'studios' && <AdminStudiosSection />}
        {activeSection === 'users' && <AdminUsersSection />}
        {activeSection === 'reviews' && <AdminReviewsSection />}
      </div>
    </div>
  );
};

export default Admin;
