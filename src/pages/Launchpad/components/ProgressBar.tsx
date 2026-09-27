export const ProgressBar = ({ progress }: { progress: number }) => {
  const value = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  return <div className="lp-progress" role="progressbar" aria-label="Pool funding" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
    <div style={{ width: `${value}%` }} />
  </div>;
};
