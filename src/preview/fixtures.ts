import axios, { AxiosError } from 'axios';
import type { FishingPostData } from '@/constats';

/** Imported only by app-preview.html; never by the production entry. */
export function installPreviewApi() {
  const scenario = new URLSearchParams(location.search).get('state');
  const now = Date.now();
  let lastPost = 0;
  const posts: FishingPostData[] = [
    { postId: 'preview-1', userId: '', posterName: 'Mia Chen', content: 'The most useful signal this week? Taking a step back and watching the bigger picture. What’s on everyone’s radar?', createdAt: now - 2400000, location: 'Vancouver, Canada', fishCatch: '' },
    { postId: 'preview-2', userId: '', posterName: 'Leo Park', content: 'Exploring the new project pools today. Always interesting to see what builders are working on next.', createdAt: now - 7200000, location: '', fishCatch: '' },
  ];
  const market = (symbol: string, price: number, change: number, volume: number, brief: string) => ({
    id: symbol === 'btc' ? 'bitcoin' : 'ethereum', symbol, name: symbol === 'btc' ? 'Bitcoin' : 'Ethereum', current_price: price,
    high_24h: price * 1.02, low_24h: price * .98, market_cap: 0, total_volume: volume,
    price_change_percentage_1h_in_currency: 0, price_change_percentage_24h: change, price_change_percentage_7d_in_currency: 0,
    last_updated: new Date().toISOString(), brief,
  });
  const names = ['Mia Chen', 'Oliver Reed', 'Leo Park', 'Sofia Kim', 'Alex Morgan', 'Noah Brooks', 'Emma Wilson', 'Ethan Cole'];
  const leaders = names.map((name, index) => ({ id: index === 4 ? 'design-preview' : `preview-${index}`, rank: index + 1, score: [18420, 16800, 14350, 12900, 12480, 11200, 10850, 9400][index], username: name.toLowerCase().replace(' ', '_'), display_name: name, avatar: '' }));
  axios.defaults.adapter = async config => {
    await new Promise(resolve => setTimeout(resolve, 180));
    const path = new URL(config.url ?? '', location.origin).pathname.replace('/api/v1/', '');
    if (scenario === 'error' && /^(markets|nolan|leaderboard)\//.test(path)) throw new AxiosError('Preview service unavailable', 'ERR_NETWORK', config);
    let data: unknown;
    if (path === 'user/tg_login') data = { id: 'design-preview', channel_id: '7654321', display_name: 'Alex Morgan', user_name: 'alex_morgan', nickname: 'Alex Morgan', avatar_url: '', level: 3 };
    else if (path === 'user/avatar') return { config, data: '', status: 204, statusText: 'No Content', headers: {} };
    else if (path === 'coin/list') data = [{ id: 'np', name: 'NolanDevPoint', symbol: 'NP', desc: 'Nolan points', bind_game_id: 'DashFun', can_withdraw: false, min_withdraw: 0, chain_addr: {} }];
    else if (path === 'coin/user_data') data = { np: { coin_id: 'np', user_id: 'design-preview', amount: 12480, create_time: now } };
    else if (path === 'spinwheel/get') data = null;
    else if (path === 'nolan/remaining') data = Math.max(0, Math.ceil((lastPost + 86400000 - Date.now()) / 1000));
    else if (path === 'nolan/posts') data = scenario === 'empty' ? [] : posts;
    else if (path === 'nolan/post') {
      const form = config.data as FormData;
      posts.unshift({ postId: crypto.randomUUID(), userId: '', posterName: 'Alex Morgan', content: String(form.get('post') ?? ''), createdAt: Date.now(), location: String(form.get('location') ?? ''), fishCatch: '' });
      lastPost = Date.now(); data = 'ok';
    }
    else if (path === 'markets/get') data = [market('btc', 97482, 2.34, 28700000000, 'Bitcoin holds its ground as the market looks ahead.'), market('eth', 3246, -1.08, 14200000000, 'Ethereum finds its rhythm after a busy week.')];
    else if (path.startsWith('markets/forecast/')) {
      const symbol = path.split('/').pop()!;
      const base = symbol === 'BTCUSDT' ? 95000 : 3100;
      const points = Array.from({ length: 24 }, (_, index) => ({ date: new Date(now + (index - 15) * 86400000).toISOString().slice(0, 10), ...(index <= 15 ? { actual: base * (1 + index * .002 + Math.sin(index * .8) * .012) } : { forecast: base * (1.025 + (index - 15) * .002 + Math.sin(index * .65) * .006) }) }));
      return { config, data: { symbol, data: scenario === 'empty' ? [] : points }, status: 200, statusText: 'OK', headers: {} };
    }
    else if (path === 'leaderboard/ndp_top') data = scenario === 'empty' ? [] : [...leaders, leaders[4]];
    else {
      // No network fallthrough: demo email, authentication, profile writes and deletion are never real.
      throw new AxiosError('This action is unavailable in the design preview.', 'ERR_BAD_REQUEST', config, undefined, { config, status: 400, statusText: 'Preview only', headers: {}, data: { msg: 'This action is unavailable in the design preview.' } });
    }
    return { config, data: { code: 0, data }, status: 200, statusText: 'OK', headers: {} };
  };
}
