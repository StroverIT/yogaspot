interface ProfileStatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

export const ProfileStatPill = ({ icon, label, value }: ProfileStatPillProps) => (
  <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm border border-border px-4 py-2 shadow-sm">
    <span className="text-primary">{icon}</span>
    <div className="text-sm">
      <span className="font-semibold text-foreground">{value ?? '—'}</span>
      <span className="text-muted-foreground ml-1">{label}</span>
    </div>
  </div>
);
