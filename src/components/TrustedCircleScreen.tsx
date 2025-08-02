
import React from 'react';
import { TrustedCircleSetup } from './trusted-circle/TrustedCircleSetup';

export const TrustedCircleScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <TrustedCircleSetup />
      </div>
    </div>
  );
};
