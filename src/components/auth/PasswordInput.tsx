
import { Input } from "@/components/ui/input";
import { useIsMobile } from '@/hooks/use-mobile';

interface PasswordInputProps {
  password: string;
  onChange: (value: string) => void;
  isSignUp: boolean;
  disabled: boolean;
}

const PasswordInput = ({ password, onChange, isSignUp, disabled }: PasswordInputProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-1">
      <label htmlFor="password" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
        Password
      </label>
      <Input
        id="password"
        type="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        value={password}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className={`${isMobile ? 'h-11 text-sm' : 'h-12 text-base'} rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 bg-background/70 backdrop-blur-sm touch-manipulation`}
        required
        minLength={6}
        disabled={disabled}
      />
      {isSignUp && (
        <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
          Must be at least 6 characters long
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
