type Props = {
  filteredCount: number;
  currentPage: number;
};

export function DiscoverCatalogResultsSummary({ filteredCount, currentPage }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <p className="text-yoga-text-soft">
        Намерени <span className="font-semibold text-yoga-text">{filteredCount}</span> студиа
      </p>
      {currentPage > 1 && (
        <p className="text-sm text-yoga-text-soft">Страница {currentPage}</p>
      )}
    </div>
  );
}
