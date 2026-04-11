'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettingsTab } from '@/components/profile/profile-settings-tab';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || 'Гост потребител';
  const displayEmail = user?.email?.trim() || 'guest@Zenno.bg';

  return <ProfileSettingsTab displayName={displayName} displayEmail={displayEmail} />;
}
