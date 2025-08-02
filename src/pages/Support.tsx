import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Phone } from 'lucide-react';
import QuickActionButton from '@/components/QuickActionButton';
import GroupChat from '@/components/support/GroupChat';
import { Button } from '@/components/ui/button';
import { usePublicSupportGroup } from '@/hooks/usePublicSupportGroup';

const Support = () => {
  const [step, setStep] = useState<'prompt' | 'chat' | 'tips' | 'hotline'>('prompt');
  const navigate = useNavigate();
  const { groupId, isLoading: groupLoading, error: groupError } = usePublicSupportGroup();

  const goHome = () => navigate('/');

  if (step === 'prompt') {
    return (
      <div className="flex flex-col items-center px-6 py-10 space-y-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-apple-gray-100 text-center">
          What do you need right now?
        </h1>
        <QuickActionButton
          id="talk-peers"
          title="Talk to Peers"
          subtitle="Chat with trusted community members"
          icon={Users}
          color="blue"
          onClick={() => setStep('chat')}
          loading={false}
        />
        <QuickActionButton
          id="read-tips"
          title="Read Coping Tips"
          subtitle="Quick exercises and calming techniques"
          icon={BookOpen}
          color="green"
          onClick={() => setStep('tips')}
          loading={false}
        />
        <QuickActionButton
          id="contact-hotline"
          title="Contact Hotline"
          subtitle="Speak with a crisis professional"
          icon={Phone}
          color="purple"
          onClick={() => setStep('hotline')}
          loading={false}
        />
        <Button variant="ghost" onClick={goHome} className="mt-4 text-sm text-gray-500 dark:text-apple-gray-400">
          ← Back Home
        </Button>
      </div>
    );
  }

  if (step === 'chat') {
    if (groupLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-gray-500">Preparing chat…</p>
        </div>
      );
    }
    if (groupError || !groupId) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <p className="text-red-600">{groupError ?? 'Unable to load support group.'}</p>
          <Button onClick={() => setStep('prompt')}>Back</Button>
        </div>
      );
    }
    return <GroupChat groupId={groupId} onBack={() => setStep('prompt')} />;
  }

  // Minimal placeholders for subsequent steps; will be fleshed out later.
  const Placeholder = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2 className="text-xl font-medium text-gray-700 dark:text-apple-gray-200">{title} (coming soon)</h2>
      <Button onClick={() => setStep('prompt')}>Back</Button>
    </div>
  );

  if (step === 'tips') return <Placeholder title="Coping Tips" />;
  if (step === 'hotline') return <Placeholder title="Crisis Hotline" />;

  return null;
};

export default Support;
