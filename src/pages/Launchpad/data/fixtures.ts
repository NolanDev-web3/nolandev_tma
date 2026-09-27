import type { LaunchPool } from './types';

export function createPools(baseTime: number): LaunchPool[] {
  const day = 86_400_000;
  const date = (days: number) => new Date(baseTime + days * day).toISOString();
  const common = {
    network: 'BNB Chain', minCents: 2500, maxCents: 50000,
    vesting: '100% unlocked when claiming opens.',
  };
  return [
    { ...common, id: 'orbit', name: 'Orbit Protocol', symbol: 'ORB', category: 'Infrastructure', color: 'mint',
      summary: 'One connection. A more open onchain world.',
      description: 'Orbit brings cross-chain activity into one simple experience. A fixed-price public token sale with an individual contribution limit.',
      priceCents: 8, targetCents: 15000000, raisedCents: 10875000, participants: 1248,
      startsAt: date(-2), endsAt: date(2.3), claimAt: date(3), featured: true,
      highlights: ['Fixed-price public sale', '25–500 USDT per participant', 'Full token unlock at claim'],
    },
    { ...common, id: 'bloom', name: 'Bloom', symbol: 'BLM', category: 'DeFi', color: 'purple',
      summary: 'Simple tools for everyday DeFi.',
      description: 'A mobile-first toolkit for discovering and managing onchain positions. This sample sale uses the same simple participation flow as the featured pool.',
      priceCents: 12, targetCents: 8000000, raisedCents: 3120000, participants: 486,
      startsAt: date(-1), endsAt: date(4), claimAt: date(5), featured: false,
      highlights: ['Built for mobile', 'Fixed token price', 'Full token unlock at claim'],
    },
    { ...common, id: 'nova', name: 'Nova Play', symbol: 'NOVA', category: 'Gaming', color: 'orange',
      summary: 'A new home for player-owned worlds.',
      description: 'Nova Play connects independent games through a shared player ecosystem. Save this sample project to find it quickly when the sale opens.',
      priceCents: 5, targetCents: 10000000, raisedCents: 0, participants: 0,
      startsAt: date(1), endsAt: date(6), claimAt: date(7), featured: false,
      highlights: ['Community public sale', 'No participation before opening', 'Full token unlock at claim'],
    },
    { ...common, id: 'forma', name: 'Forma', symbol: 'FORM', category: 'AI & Data', color: 'blue',
      summary: 'Better data for open intelligence.',
      description: 'Forma is a decentralized data project. Its completed sale includes an allocation ready for token claim.',
      priceCents: 10, targetCents: 6000000, raisedCents: 6000000, participants: 932,
      startsAt: date(-8), endsAt: date(-2), claimAt: date(-1), featured: false,
      highlights: ['Sale completed', 'Claiming is open', 'Full token unlock at claim'],
    },
  ];
}
