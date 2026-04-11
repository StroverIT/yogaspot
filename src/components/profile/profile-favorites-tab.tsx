import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Studio } from '@/data/mock-data';
import { ProfileFavoriteStudioCard } from '@/components/profile/profile-favorite-studio-card';

interface ProfileFavoritesTabProps {
  favoriteStudios: Studio[];
  showEmptyFavorites: boolean;
  onToggleEmptyFavorites: () => void;
  onRemoveFavorite: (studioId: string) => void;
}

export const ProfileFavoritesTab = ({
  favoriteStudios,
  showEmptyFavorites,
  onToggleEmptyFavorites,
  onRemoveFavorite,
}: ProfileFavoritesTabProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground">{favoriteStudios.length} любими студиа</p>
      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onToggleEmptyFavorites}>
        {showEmptyFavorites ? 'Покажи данни' : 'Покажи празно'}
      </Button>
    </div>

    {favoriteStudios.length === 0 ? (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">Няма любими студиа</h3>
        <p className="text-muted-foreground mb-6">
          Натиснете {'\u2764\uFE0F'} на студио, за да го добавите тук.
        </p>
        <Button asChild variant="outline">
          <Link href="/discover">Открий студио</Link>
        </Button>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {favoriteStudios.map((studio) => (
          <ProfileFavoriteStudioCard key={studio.id} studio={studio} onRemoveFavorite={onRemoveFavorite} />
        ))}
      </div>
    )}
  </div>
);
