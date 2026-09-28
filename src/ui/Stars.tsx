export function Stars({ count, size = 40 }: { count: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? 'star star--on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}
