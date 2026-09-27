import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { mockTelegramEnv, parseInitData } from '@telegram-apps/sdk-react';
import '@telegram-apps/telegram-ui/dist/styles.css';
import '@/index.css';
import { installPreviewApi } from './fixtures';

async function startPreview() {
  if (!import.meta.env.DEV) return;
  installPreviewApi();
  // Import first, then replace any template mock environment with a clearly fictitious account.
  const [{ App }, { default: Login }, { default: SetupProfile }, { init }] = await Promise.all([
    import('@/components/App'), import('@/components/DashFunLogin/DashFunLogin'), import('@/components/DashFunLogin/SetupProfile'), import('@/init'),
  ]);
  const raw = new URLSearchParams({ user: JSON.stringify({ id: 7654321, first_name: 'Alex', last_name: 'Morgan', username: 'alex_morgan', language_code: 'en' }), auth_date: String(Math.floor(Date.now() / 1000)), hash: 'design-preview-not-a-real-token' }).toString();
  mockTelegramEnv({ platform: 'browser', version: '8.0', initData: parseInitData(raw), initDataRaw: raw, themeParams: { bgColor: '#0c1521', secondaryBgColor: '#0c1521', textColor: '#f3f6fa', hintColor: '#91a1b5', buttonColor: '#bbf5d1', buttonTextColor: '#14281c' } });
  init(false, 'tdesktop');
  const screen = new URLSearchParams(location.search).get('screen');
  createRoot(document.getElementById('root')!).render(<>
    <div className="nd-preview-toolbar"><span>DESIGN PREVIEW · SAMPLE DATA</span><a href={screen ? '/app-preview.html' : '/app-preview.html?screen=login'}>{screen ? 'View app' : 'Login screens'}</a></div>
    <div className="nd-preview-content">{screen === 'login' ? <Login restoreSession={false} /> : screen === 'setup' ? <SetupProfile /> : <App RouterComponent={HashRouter} telemetry={false} />}</div>
  </>);
}
void startPreview();
