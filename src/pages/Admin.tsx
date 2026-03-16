import { useAuth } from '@/contexts/AuthContext';
import { mockStudios, mockInstructors, mockClasses, mockReviews } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Building2, Calendar, Star, Trash2, EyeOff, TrendingUp, Search, Shield, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const StatCard = ({ icon, label, value, trend, color }: {
  icon: React.ReactNode; label: string; value: string | number; trend?: string; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden group hover:shadow-lg transition-shadow"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${color}`} />
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>{icon}</div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
    <p className="font-display text-3xl font-bold text-foreground">{value}</p>
    {trend && (
      <div className="flex items-center gap-1 mt-2 text-sm text-primary">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>{trend}</span>
      </div>
    )}
  </motion.div>
);

const Admin = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'studios' | 'users' | 'reviews'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { key: 'overview' as const, label: 'Преглед', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'studios' as const, label: 'Студиа', icon: <Building2 className="h-4 w-4" /> },
    { key: 'users' as const, label: 'Потребители', icon: <Users className="h-4 w-4" /> },
    { key: 'reviews' as const, label: 'Ревюта', icon: <Star className="h-4 w-4" /> },
  ];

  const totalEnrollments = mockClasses.reduce((s, c) => s + c.enrolled, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-sage/15 border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Администрация</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">Админ панел</h1>
            <p className="text-muted-foreground">Пълен контрол над платформата YogaSpot</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Nav tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === s.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              {activeSection === s.key && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">{s.icon}{s.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Потребители" value="1,245" trend="+12% този месец" color="bg-primary" />
                <StatCard icon={<Building2 className="h-5 w-5 text-accent" />} label="Студиа" value={mockStudios.length} trend="+2 нови" color="bg-accent" />
                <StatCard icon={<Calendar className="h-5 w-5 text-sage-foreground" />} label="Записвания" value={totalEnrollments} trend="+8% тази седмица" color="bg-sage" />
                <StatCard icon={<Star className="h-5 w-5 text-accent" />} label="Ревюта" value={mockReviews.length} color="bg-accent" />
              </div>

              {/* Recent activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последни студиа</h3>
                  <div className="space-y-3">
                    {mockStudios.slice(0, 3).map(studio => (
                      <div key={studio.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🧘</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{studio.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{studio.address}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          <span className="text-sm font-semibold text-foreground">{studio.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последни ревюта</h3>
                  <div className="space-y-3">
                    {mockReviews.map(review => (
                      <div key={review.id} className="p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">{review.userName}</span>
                          <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}</div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'studios' && (
            <motion.div key="studios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Търси студио..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-3">
                {mockStudios.filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((studio, i) => (
                  <motion.div
                    key={studio.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-sage/30 flex items-center justify-center text-xl">🧘</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{studio.name}</h3>
                        <p className="text-sm text-muted-foreground">{studio.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span className="text-sm font-bold text-accent">{studio.rating}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg"><EyeOff className="h-4 w-4 mr-1.5" /> Скрий</Button>
                      <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1.5" /> Изтрий</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Търси потребител..." className="pl-10 rounded-xl" />
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Потребител</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Роля</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Статус</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Анна Кирилова', email: 'anna@mail.bg', role: 'client', active: true },
                      { name: 'Студио Лотос', email: 'lotos@biz.bg', role: 'business', active: true },
                      { name: 'Петър Димов', email: 'petar@mail.bg', role: 'client', active: false },
                    ].map((u, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={u.role === 'business' ? 'default' : 'secondary'} className="rounded-full">
                            {u.role === 'client' ? 'Потребител' : 'Бизнес'}
                          </Badge>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                            <span className="text-sm text-muted-foreground">{u.active ? 'Активен' : 'Неактивен'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive rounded-lg">Спри достъп</Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeSection === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="space-y-3">
                {mockReviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {review.userName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{review.userName}</span>
                          <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />)}</div>
                        </div>
                        <p className="text-sm text-foreground/80">{review.text}</p>
                        <p className="mt-1.5 text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 rounded-lg">
                      <Trash2 className="h-4 w-4 mr-1.5" /> Премахни
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
