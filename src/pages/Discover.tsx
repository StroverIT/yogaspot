import { useState, useMemo } from 'react';
import Link from "next/link";
import { mockStudios, mockClasses, YOGA_TYPES, DIFFICULTY_LEVELS } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Search, SlidersHorizontal, Heart, X, Sparkles, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';

const Discover = () => {
  const [search, setSearch] = useState('');
  const [yogaType, setYogaType] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const activeFilterCount = [yogaType !== 'all', difficulty !== 'all'].filter(Boolean).length;

  const filtered = useMemo(() => {
    let studios = [...mockStudios];
    if (search) {
      const q = search.toLowerCase();
      studios = studios.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    if (yogaType !== 'all') {
      const studioIds = mockClasses.filter(c => c.yogaType === yogaType).map(c => c.studioId);
      studios = studios.filter(s => studioIds.includes(s.id));
    }
    if (difficulty !== 'all') {
      const studioIds = mockClasses.filter(c => c.difficulty === difficulty).map(c => c.studioId);
      studios = studios.filter(s => studioIds.includes(s.id));
    }
    if (sortBy === 'rating') studios.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'reviews') studios.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sortBy === 'name') studios.sort((a, b) => a.name.localeCompare(b.name));
    return studios;
  }, [search, yogaType, difficulty, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setYogaType('all');
    setDifficulty('all');
  };

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-sage/20 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Разгледай всички студиа</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Открий студио</h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Намери перфектното място за твоята практика сред {mockStudios.length} студиа
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            className="mt-8 max-w-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Търси по име или адрес..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl bg-background/80 backdrop-blur-sm border-border shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full gap-2 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Филтри
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Quick type chips */}
            <div className="hidden md:flex flex-wrap gap-2">
              <button
                onClick={() => setYogaType('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  yogaType === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Всички
              </button>
              {YOGA_TYPES.slice(0, 6).map(t => (
                <button
                  key={t}
                  onClick={() => setYogaType(yogaType === t ? 'all' : t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    yogaType === t
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{filtered.length} резултата</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] rounded-full h-9 text-sm">
                <SelectValue placeholder="Сортирай" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">По рейтинг</SelectItem>
                <SelectItem value="reviews">По ревюта</SelectItem>
                <SelectItem value="name">По име</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden mb-6"
            >
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-card border border-border">
                <Select value={yogaType} onValueChange={setYogaType}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Тип йога" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички типове</SelectItem>
                    {YOGA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Ниво" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички нива</SelectItem>
                    {DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop filters row */}
        <div className="hidden md:flex items-center gap-3 mb-8">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[160px] rounded-full h-9 text-sm">
              <SelectValue placeholder="Ниво" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички нива</SelectItem>
              {DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full text-destructive gap-1">
              <X className="h-3.5 w-3.5" /> Изчисти филтри
            </Button>
          )}
        </div>

        {/* Studio Grid */}
        <DiscoverGrid studios={filtered} onAuthRequired={() => setAuthModalOpen(true)} />

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Няма намерени студиа</p>
            <p className="text-muted-foreground mb-4">Опитайте с различни критерии за търсене</p>
            <Button variant="outline" className="rounded-full" onClick={clearFilters}>
              Изчисти филтрите
            </Button>
          </motion.div>
        )}
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

const DiscoverGrid = ({ studios, onAuthRequired }: { studios: typeof mockStudios; onAuthRequired: () => void }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const handleFavorite = (e: React.MouseEvent, studioId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { onAuthRequired(); return; }
    const added = toggleFavorite(studioId);
    toast.success(added ? 'Добавено в любими' : 'Премахнато от любими');
  };

  const classCount = (studioId: string) => mockClasses.filter(c => c.studioId === studioId).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {studios.map((studio, i) => (
        <motion.div
          key={studio.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
        >
          <div className="relative group h-full">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleFavorite(e, studio.id)}
              className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm"
            >
              <Heart className={`h-4 w-4 transition-colors ${isFavorite(studio.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
            </motion.button>
            <Link to={`/studio/${studio.id}`} className="block h-full">
              <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 h-full flex flex-col">
                <div className="aspect-[16/9] bg-gradient-to-br from-sage/40 via-primary/15 to-warm/30 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
                  <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-500">🧘</span>
                  {/* Class count badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                    <Users className="h-3 w-3" />
                    {classCount(studio.id)} класа
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {studio.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-accent/10">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      <span className="text-sm font-bold text-accent">{studio.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{studio.address}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 flex-1">{studio.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{studio.reviewCount} ревюта</span>
                    <div className="flex gap-1.5">
                      {studio.amenities.parking && <span className="text-xs bg-muted px-2 py-0.5 rounded-full" title="Паркинг">🅿️</span>}
                      {studio.amenities.shower && <span className="text-xs bg-muted px-2 py-0.5 rounded-full" title="Душ">🚿</span>}
                      {studio.amenities.changingRoom && <span className="text-xs bg-muted px-2 py-0.5 rounded-full" title="Съблекалня">👔</span>}
                      {studio.amenities.equipmentRental && <span className="text-xs bg-muted px-2 py-0.5 rounded-full" title="Оборудване">🧘</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Discover;
