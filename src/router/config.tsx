import { RouteObject } from 'react-router-dom';
import HomePage from '@/pages/home/page';
import PlatformPage from '@/pages/platform/page';
import HowItWorksPage from '@/pages/how-it-works/page';
import IntelligencePage from '@/pages/intelligence/page';
import SignInPage from '@/pages/auth/SignInPage';
import RequestAccessPage from '@/pages/auth/RequestAccessPage';
import DashboardPage from '@/pages/app/dashboard/page';
import WatchlistPage from '@/pages/app/watchlist/page';
import CueEnginePage from '@/pages/app/cue-engine/page';
import ChartsPage from '@/pages/app/charts/page';
import AlertsPage from '@/pages/app/alerts/page';
import HistoryPage from '@/pages/app/history/page';
import SettingsPage from '@/pages/app/settings/page';

const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/platform', element: <PlatformPage /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/intelligence', element: <IntelligencePage /> },
  { path: '/signin', element: <SignInPage /> },
  { path: '/request-access', element: <RequestAccessPage /> },
  { path: '/app/dashboard', element: <DashboardPage /> },
  { path: '/app/watchlist', element: <WatchlistPage /> },
  { path: '/app/cue-engine', element: <CueEnginePage /> },
  { path: '/app/charts', element: <ChartsPage /> },
  { path: '/app/alerts', element: <AlertsPage /> },
  { path: '/app/history', element: <HistoryPage /> },
  { path: '/app/settings', element: <SettingsPage /> },
  { path: '*', element: <HomePage /> },
];

export default routes;
