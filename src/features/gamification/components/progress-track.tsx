export function ProgressTrack({ index, total, label = "Domande completate" }: { index: number; total: number; label?: string }) {
  const width = total > 0 ? Math.min(100, Math.max(0, (index / total) * 100)) : 0;
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={index}
    >
      <span style={{ width: `${width}%` }} />
    </div>
  );
}
