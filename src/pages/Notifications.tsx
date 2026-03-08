import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BookOpen, Trophy, Flame, Info, CheckCheck, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig: Record<string, { icon: typeof Bell; label: string; color: string }> = {
  lesson: { icon: BookOpen, label: 'Lesson', color: 'bg-primary/10 text-primary' },
  quiz: { icon: Trophy, label: 'Quiz', color: 'bg-accent text-accent-foreground' },
  streak: { icon: Flame, label: 'Streak', color: 'bg-destructive/10 text-destructive' },
  info: { icon: Info, label: 'Info', color: 'bg-secondary text-secondary-foreground' },
};

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const handleClick = (n: typeof notifications[0]) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllAsRead()}>
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Filters */}
          <Tabs value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                <Filter className="w-3.5 h-3.5" /> All
              </TabsTrigger>
              <TabsTrigger value="lesson" className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Lessons
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="streak" className="gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Streaks
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-1.5">
                <Info className="w-3.5 h-3.5" /> Info
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Notification List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">No notifications</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {filter !== 'all' ? 'Try a different filter' : "You're all caught up!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((n) => {
                const config = typeConfig[n.type] || typeConfig.info;
                const Icon = config.icon;
                return (
                  <Card
                    key={n.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !n.is_read ? 'border-primary/20 bg-primary/[0.02]' : ''
                    }`}
                    onClick={() => handleClick(n)}
                  >
                    <CardContent className="flex gap-4 p-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {config.label}
                            </Badge>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
