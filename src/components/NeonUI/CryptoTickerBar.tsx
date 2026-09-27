import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
export type Ticker = { symbol: string; price: number; change24h: number; volume24h: number; brife?: string; iconUrl?: string };
export interface CryptoTickerBannerProps { left: Ticker; right: Ticker; live?: boolean; className?: string }
const usd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
function TickerBlock({ ticker }: { ticker: Ticker }) {
  const up = ticker.change24h >= 0;
  return <article className="nd-card nd-market">
    <div className="nd-market-top">
      <span className="nd-market-icon">{ticker.iconUrl ? <img src={ticker.iconUrl} alt="" /> : ticker.symbol[0]}</span>
      <div><strong>{ticker.symbol}</strong><small>{ticker.symbol === 'BTC' ? 'Bitcoin' : 'Ethereum'}</small></div>
      <span className={`nd-change ${up ? 'nd-up' : 'nd-down'}`}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{ticker.price > 0 ? `${up ? '+' : ''}${ticker.change24h.toFixed(2)}%` : '—'}</span>
    </div>
    <div className="nd-market-values"><strong className="nd-market-price">{ticker.price > 0 ? usd(ticker.price) : '—'}</strong><div className="nd-market-volume"><span>24H VOLUME</span>{ticker.price > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(ticker.volume24h) : '—'}</div></div>
    {ticker.brife && <p className="nd-market-brief">{ticker.brife}</p>}
  </article>;
}
export function CryptoTickerBanner({ left, right, live = false, className = '' }: CryptoTickerBannerProps) {
  return <section className={className} aria-label="Market overview"><div className="nd-section-heading"><h2 className="nd-section-title">Market overview</h2><span>{live ? 'Updates every 10s' : 'Latest prices'}</span></div><div className="nd-market-grid"><TickerBlock ticker={left} /><TickerBlock ticker={right} /></div></section>;
}
