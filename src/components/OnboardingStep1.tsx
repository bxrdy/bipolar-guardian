import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Heart } from 'lucide-react';
interface OnboardingStep1Props {
  onNext: (data: {
    firstName: string;
  }) => void;
}
const OnboardingStep1 = ({
  onNext
}: OnboardingStep1Props) => {
  const [firstName, setFirstName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim()) {
      onNext({
        firstName: firstName.trim()
      });
    }
  };
  return <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bipolar Guardian</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Your personal companion for mental wellness and mood tracking
          </p>
        </div>

        {/* Welcome Form */}
        <div className="space-y-6">
          

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                What's your first name?
              </label>
              <Input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter your first name" className="h-14 text-lg rounded-xl border-2 focus:border-purple-500 transition-colors" required />
            </div>

            <Button type="submit" disabled={!firstName.trim()} className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200">
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          <div className="w-8 h-2 bg-purple-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>;
};
export default OnboardingStep1;