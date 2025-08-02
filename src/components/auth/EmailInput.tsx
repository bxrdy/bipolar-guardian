
import { Input } from "@/components/ui/input";
import { useIsMobile } from '@/hooks/use-mobile';

interface EmailInputProps {
  email: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const EmailInput = ({ email, onChange, disabled }: EmailInputProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-1">
      <label htmlFor="email" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
        Email address
      </label>
      <Input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        placeholder="your.email@example.com"
        className={`${isMobile ? 'h-11 text-sm' : 'h-12 text-base'} rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 bg-background/70 backdrop-blur-sm touch-manipulation`}
        required
        disabled={disabled}
      />
    </div>
  );
};

export default EmailInput;
