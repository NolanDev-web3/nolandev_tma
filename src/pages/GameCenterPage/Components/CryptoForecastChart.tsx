import { MarketsApi } from '@/utils/DashFunApi';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, LoadingState } from '@/components/Design/Primitives';

export interface ForecastPoint { date: string; actual?: number | null; forecast?: number | null }
export interface ForecastResponse { symbol: string; data: ForecastPoint[] }
export function stitchForecastAnchor(input: ForecastPoint[]): ForecastPoint[] {
  const data = input.map(point => ({ ...point })).sort((a, b) => a.date.localeCompare(b.date));
  const index = data.findIndex(point => point.forecast != null);
  if (index > 0 && data[index - 1].actual != null) data[index - 1].forecast = data[index - 1].actual;
  return data.map(point => ({ ...point, forecast: typeof point.forecast === 'number' ? Number(point.forecast.toFixed(2)) : point.forecast ?? null }));
}
const shortDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
export default function CryptoForecastChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const token = useSignal(initData.raw);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    MarketsApi.forecast(token as string, symbol).then(points => {
      if (active) setData(stitchForecastAnchor(points));
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [symbol, token, retry]);
  const latest = [...data].reverse().find(point => point.actual != null)?.actual;
  const price = latest == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(latest);
  return <section className="nd-card nd-chart-card" aria-label={`${symbol} price forecast`}>
    <div className="nd-chart-header"><div><h2>{symbol === 'BTCUSDT' ? 'Bitcoin' : 'Ethereum'} <span className="nd-muted text-xs">/ USDT</span></h2><p>Actual price & forecast</p></div><strong>{loading ? '—' : price}</strong></div>
    {loading ? <LoadingState>Loading price history…</LoadingState> : error ? <div className="nd-error" role="alert">Forecast is unavailable.<button onClick={() => setRetry(value => value + 1)}>Retry</button></div> : data.length === 0 ? <EmptyState title="No forecast yet" description="Price history and forecasts will appear here when available." /> : <>
      <div className="w-full h-[255px] md:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }} accessibilityLayer>
            <CartesianGrid stroke="#263445" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: '#91a1b5', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} dy={10} />
            <YAxis width={47} tick={{ fill: '#91a1b5', fontSize: 10 }} tickFormatter={value => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value))} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1b2c3c', border: '1px solid #3a4e5e', borderRadius: 10, color: '#f3f6fa', fontSize: 12 }} labelFormatter={label => shortDate(String(label))} formatter={(value, name) => [Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), name === 'actual' ? 'Actual' : 'Forecast']} />
            <Line type="monotone" dataKey="actual" stroke="#bbf5d1" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="forecast" stroke="#c5b5f5" strokeWidth={2.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="nd-chart-legend"><span><i />Actual</span><span><i />Forecast</span></div>
    </>}
  </section>;
}
