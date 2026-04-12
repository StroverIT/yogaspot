import { Activity, Heart, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStatPill } from '@/components/profile/profile-stat-pill';

interface ProfileHeroProps {
  displayName: string;
  displayEmail: string;
  initials: string;
  avatarUrl?: string | null;
  totalClasses: number;
  uniqueStudios: number;
  favoriteCount: number;
}

export const ProfileHero = ({
  displayName,
  displayEmail,
  initials,
  avatarUrl,
  totalClasses,
  uniqueStudios,
  favoriteCount,
}: ProfileHeroProps) => (
  <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/40 to-accent/10 p-8 mb-8 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <div className="text-center sm:text-left flex-1">
        <h1 className="font-display text-3xl font-bold text-foreground">{displayName}</h1>
        <p className="text-muted-foreground mt-1">{displayEmail}</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
          <ProfileStatPill icon={<Activity className="h-4 w-4" />} label="Класове" value={totalClasses} />
          <ProfileStatPill icon={<MapPin className="h-4 w-4" />} label="Студиа" value={uniqueStudios} />
          <ProfileStatPill icon={<Heart className="h-4 w-4" />} label="Любими" value={favoriteCount} />
        </div>
      </div>
    </div>
  </div>
);
