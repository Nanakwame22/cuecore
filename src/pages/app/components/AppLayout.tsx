import { ReactNode, useEffect, useRef } from 'react';
import AppSidebar from './AppSidebar';
import AppTopBar from './AppTopBar';
import { useSignalAlerts } from '@/hooks/useSignalAlerts';
import { useChime } from '@/hooks/useChime';
import SignalToastContainer from '@/components/feature/SignalToastContainer';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AppLayout = ({ children, title, subtitle }: AppLayoutProps) => {
  const { notifications, toastQueue, dismissToast, markAllRead, markRead, unreadCount } = useSignalAlerts(80);
  const { soundEnabled, toggleSound, playChime } = useChime();

  // Track previous toast queue length to detect new toasts
  const prevToastLenRef = useRef(0);
  useEffect(() => {
    if (toastQueue.length > prevToastLenRef.current) {
      playChime();
    }
    prevToastLenRef.current = toastQueue.length;
  }, [toastQueue, playChime]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #080E16 0%, #0A1018 50%, #080C14 100%)' }}>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppTopBar
          title={title}
          subtitle={subtitle}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <SignalToastContainer toasts={toastQueue} onDismiss={dismissToast} />
    </div>
  );
};

export default AppLayout;
