interface ProfileInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const ProfileInfoItem = ({ icon, label, value }: ProfileInfoItemProps) => (
  <div className="flex items-start gap-2.5">
    <span className="text-primary mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);
