import { useState } from 'react';
import { PageHeading } from '@/components/Design/Primitives';
import ProfileHeader from '../Components/ProfileHeader';
import CryptoForecastChart from '../Components/CryptoForecastChart';
export function GameCenter_GamesPage() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  return <div id="GameCenter_GamesPage" className="nd-page">
    <ProfileHeader />
    <PageHeading eyebrow="Forecast" title="A view of what’s next." description="Explore price history and projected movements." />
    <div className="nd-segmented" aria-label="Choose a market">
      <button aria-pressed={symbol === 'BTCUSDT'} onClick={() => setSymbol('BTCUSDT')}>Bitcoin · BTC</button>
      <button aria-pressed={symbol === 'ETHUSDT'} onClick={() => setSymbol('ETHUSDT')}>Ethereum · ETH</button>
    </div>
    <CryptoForecastChart symbol={symbol} />
    <div className="nd-card nd-card-pad"><h2 className="nd-section-title">Reading the chart</h2><p className="nd-muted text-xs leading-6 mt-2">The solid line follows actual prices. The dashed line shows the forecast. Tap a point to see its date and price.</p></div>
  </div>;
}
