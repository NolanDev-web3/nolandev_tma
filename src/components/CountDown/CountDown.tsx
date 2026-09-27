export function CountDown({ remaining }: { remaining: number }) {
  if (remaining <= 0) return null;
  const time = [Math.floor(remaining / 3600), Math.floor(remaining % 3600 / 60), remaining % 60].map(value => String(value).padStart(2, '0')).join(':');
  return <div className="nd-card nd-countdown"><span>Next Daily Alpha in</span><strong>{time}</strong></div>;
}
