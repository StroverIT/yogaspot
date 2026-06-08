export function SiteOfferBanner({ message }: { message: string }) {
  return (
    <div
      className="border-b border-primary/15 bg-primary/5 px-4 py-2 text-center text-sm text-foreground/80"
      role="status"
    >
      {message}
    </div>
  );
}
