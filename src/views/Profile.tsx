import { useState } from 'react';
import { Calendar, Heart, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStudios, mockClasses, mockInstructors } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { ProfileHero } from '@/components/profile/profile-hero';
import { ProfileHistoryTab } from '@/components/profile/profile-history-tab';
import { ProfileFavoritesTab } from '@/components/profile/profile-favorites-tab';
import { ProfileSettingsTab } from '@/components/profile/profile-settings-tab';
import { ProfileClassDetailDialog } from '@/components/profile/profile-class-detail-dialog';
import { mockAttendedClasses } from '@/components/profile/profile-mock-data';

const Profile = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [showEmptyHistory, setShowEmptyHistory] = useState(false);
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);

  const displayName = user?.name || 'Гост потребител';
  const displayEmail = user?.email || 'guest@Zenno.bg';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const selected = selectedClass ? mockClasses.find((c) => c.id === selectedClass) ?? null : null;
  const selectedInstructor = selected ? mockInstructors.find((i) => i.id === selected.instructorId) : undefined;
  const selectedStudio = selected ? mockStudios.find((s) => s.id === selected.studioId) : undefined;
  const attendedDate = selectedClass ? mockAttendedClasses.find((a) => a.classId === selectedClass)?.attendedDate : null;

  const favoriteStudios = showEmptyFavorites ? [] : mockStudios.filter((s) => favoriteIds.includes(s.id));
  const attendedClasses = showEmptyHistory ? [] : mockAttendedClasses;

  const totalClasses = attendedClasses.length;
  const uniqueStudios = new Set(
    attendedClasses
      .map((a) => {
        const cls = mockClasses.find((c) => c.id === a.classId);
        return cls?.studioId;
      })
      .filter(Boolean)
  ).size;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHero
        displayName={displayName}
        displayEmail={displayEmail}
        initials={initials}
        totalClasses={totalClasses}
        uniqueStudios={uniqueStudios}
        favoriteCount={favoriteIds.length}
      />

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="history" className="flex-1 sm:flex-none gap-2">
            <Calendar className="h-4 w-4" />
            Посетени класове
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 sm:flex-none gap-2">
            <Heart className="h-4 w-4" />
            Любими ({favoriteIds.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none gap-2">
            <User className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <ProfileHistoryTab
          attendedClasses={attendedClasses}
          totalClasses={totalClasses}
          showEmptyHistory={showEmptyHistory}
          onToggleEmptyHistory={() => setShowEmptyHistory(!showEmptyHistory)}
          onSelectClass={setSelectedClass}
        />

        <ProfileFavoritesTab
          favoriteStudios={favoriteStudios}
          showEmptyFavorites={showEmptyFavorites}
          onToggleEmptyFavorites={() => setShowEmptyFavorites(!showEmptyFavorites)}
          onRemoveFavorite={toggleFavorite}
        />

        <ProfileSettingsTab displayName={displayName} displayEmail={displayEmail} />
      </Tabs>

      <ProfileClassDetailDialog
        open={!!selectedClass}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        selected={selected}
        selectedInstructor={selectedInstructor}
        selectedStudio={selectedStudio}
        attendedDate={attendedDate}
      />
    </div>
  );
};

export default Profile;
