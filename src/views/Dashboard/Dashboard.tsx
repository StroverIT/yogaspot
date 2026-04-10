import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockStudios, mockClasses, mockInstructors, type ScheduleEntry } from '@/data/mock-data';
import { toast } from 'sonner';

import type { ModalType, Section } from './dashboardTypes';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardMobileNav } from './components/DashboardMobileNav';
import { OverviewSection } from './components/OverviewSection';
import { StudiosSection } from './components/StudiosSection';
import { InstructorsSection } from './components/InstructorsSection';
import { ClassesSection } from './components/ClassesSection';
import { ScheduleSection } from './components/ScheduleSection';
import { StudioModal } from './components/modals/StudioModal';
import { InstructorModal } from './components/modals/InstructorModal';
import { ClassModal } from './components/modals/ClassModal';
import { ScheduleModal } from './components/modals/ScheduleModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [studiosRefreshKey, setStudiosRefreshKey] = useState(0);
  const myStudios = mockStudios.filter(s => s.businessId === 'b1');
  const myClasses = mockClasses.filter(c => myStudios.some(s => s.id === c.studioId));
  const myInstructors = mockInstructors.filter(i => myStudios.some(s => s.id === i.studioId));
  const totalEnrolled = myClasses.reduce((sum, c) => sum + c.enrolled, 0);
  const totalCapacity = myClasses.reduce((sum, c) => sum + c.maxCapacity, 0);
  const avgRating = myStudios.length ? (myStudios.reduce((s, st) => s + st.rating, 0) / myStudios.length).toFixed(1) : '0';
  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const revenue = myClasses.reduce((sum, c) => sum + c.enrolled * c.price, 0);

  const handleSave = () => {
    const labels = { studio: 'Студиото', instructor: 'Инструкторът', class: 'Класът' };
    toast.success(`${labels[modalType!]} беше запазен успешно!`);
    setModalType(null);
    setStudiosRefreshKey((k) => k + 1);
  };

  const displayName = user?.name || 'Бизнес потребител';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <DashboardSidebar
        displayName={displayName}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        revenue={revenue}
      />

      <DashboardMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        {activeSection === 'overview' && (
          <OverviewSection
            avgRating={avgRating}
            totalEnrolled={totalEnrolled}
            totalCapacity={totalCapacity}
            occupancyRate={occupancyRate}
            myStudios={myStudios}
            myClasses={myClasses}
            myInstructors={myInstructors}
            revenue={revenue}
          />
        )}
        {activeSection === 'studios' && (
          <StudiosSection refreshKey={studiosRefreshKey} onAdd={() => setModalType('studio')} onEdit={() => setModalType('studio')} />
        )}
        {activeSection === 'instructors' && (
          <InstructorsSection instructors={myInstructors} onAdd={() => setModalType('instructor')} onEdit={() => setModalType('instructor')} />
        )}
        {activeSection === 'classes' && (
          <ClassesSection classes={myClasses} onAdd={() => setModalType('class')} onEdit={() => setModalType('class')} />
        )}
        {activeSection === 'schedule' && (
          <ScheduleSection
            studios={myStudios}
            onAdd={() => { setEditingSchedule(null); setModalType('schedule'); }}
            onEdit={(entry) => { setEditingSchedule(entry); setModalType('schedule'); }}
          />
        )}

        {/* Modals */}
        <StudioModal open={modalType === 'studio'} onClose={() => setModalType(null)} onSave={handleSave} />
        <InstructorModal open={modalType === 'instructor'} onClose={() => setModalType(null)} onSave={handleSave} studios={myStudios} />
        <ClassModal open={modalType === 'class'} onClose={() => setModalType(null)} onSave={handleSave} studios={myStudios} instructors={myInstructors} />
        <ScheduleModal open={modalType === 'schedule'} onClose={() => { setModalType(null); setEditingSchedule(null); }} onSave={handleSave} studios={myStudios} instructors={myInstructors} entry={editingSchedule} />
      </main>
    </div>
  );
};

export default Dashboard;
