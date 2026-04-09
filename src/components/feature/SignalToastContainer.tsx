import { createPortal } from 'react-dom';
import { SignalNotification } from '@/hooks/useSignalAlerts';
import SignalToast from './SignalToast';

interface SignalToastContainerProps {
  toasts: SignalNotification[];
  onDismiss: (id: string) => void;
}

const SignalToastContainer = ({ toasts, onDismiss }: SignalToastContainerProps) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end"
      style={{ pointerEvents: 'none' }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <SignalToast signal={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default SignalToastContainer;
