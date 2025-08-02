
import TestingPanel from "@/components/TestingPanel";

const Testing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Testing Dashboard</h1>
          <p className="text-gray-600">
            Verify data collection and stream controls
          </p>
        </div>
        <TestingPanel />
        
        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default Testing;
