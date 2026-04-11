import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ProfileSettingsTabProps {
  displayName: string;
  displayEmail: string;
}

export const ProfileSettingsTab = ({ displayName, displayEmail }: ProfileSettingsTabProps) => (
  <div>
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">Лични данни</h2>
          <p className="text-sm text-muted-foreground mb-6">Актуализирайте вашата информация</p>
          <Separator className="mb-6" />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name">Име</Label>
            <Input id="name" defaultValue={displayName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Имейл</Label>
            <Input
              id="email"
              value={displayEmail}
              readOnly
              className="bg-muted text-muted-foreground cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <p className="text-xs text-muted-foreground">Имейлът не може да се променя от тук.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" placeholder="+359 ..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Град</Label>
            <Input id="city" placeholder="София" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button>Запази промените</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
