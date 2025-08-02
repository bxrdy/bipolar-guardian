import { useNavigate, useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Floating action button that is shown on every screen (except the /support page)
 * to give users a single-tap path to community help.  Large hit-target & high
 * contrast for accessibility when the user may be stressed.
 */
const NeedSupportButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the FAB if we are already on the support screen or homepage
  if (location.pathname.startsWith('/support') || location.pathname === '/') return null;

  return (
    <Button
      onClick={() => navigate('/support')}
      className="fixed bottom-6 right-6 z-50 rounded-full p-4 bg-rose-600 hover:bg-rose-700 text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-400/50 dark:focus:ring-rose-600/60"
      size="icon"
      aria-label="Need Support"
    >
      <HelpCircle className="w-7 h-7" />
    </Button>
  );
};

export default NeedSupportButton;
