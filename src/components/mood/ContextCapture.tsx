
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVITY_OPTIONS, LOCATION_OPTIONS, SOCIAL_SITUATION_OPTIONS } from "@/types/mood";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ContextCaptureProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  activities: string[];
  onActivitiesChange: (activities: string[]) => void;
  location: string;
  onLocationChange: (location: string) => void;
  socialSituation: string;
  onSocialSituationChange: (situation: string) => void;
  journalMode?: boolean;
}

const ContextCapture = ({
  notes,
  onNotesChange,
  activities,
  onActivitiesChange,
  location,
  onLocationChange,
  socialSituation,
  onSocialSituationChange,
  journalMode = false
}: ContextCaptureProps) => {
  const isMobile = useIsMobile();
  const maxCharacters = 500;
  const remainingCharacters = maxCharacters - notes.length;

  const handleActivityToggle = (activity: string) => {
    if (activities.includes(activity)) {
      onActivitiesChange(activities.filter(a => a !== activity));
    } else {
      onActivitiesChange([...activities, activity]);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxCharacters) {
      onNotesChange(text);
    }
  };

  if (journalMode) {
    return (
      <div className="space-y-4">
        <div>
          <Textarea
            placeholder="How are you feeling today? What's on your mind?"
            value={notes}
            onChange={handleNotesChange}
            className={cn("resize-none", isMobile ? "min-h-[100px] text-base" : "min-h-[120px]")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          What are you doing? (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_OPTIONS.map((activity) => (
            <Badge
              key={activity}
              variant={activities.includes(activity) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-200",
                isMobile && "min-h-[36px] px-3 text-sm"
              )}
              onClick={() => handleActivityToggle(activity)}
            >
              {activity}
            </Badge>
          ))}
        </div>
      </div>

      <div className={cn("gap-4", isMobile ? "space-y-4" : "grid grid-cols-2")}>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Location (Optional)
          </label>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className={cn(
              "w-full p-2 border border-gray-300 rounded-md",
              isMobile && "min-h-[44px] text-base"
            )}
          >
            <option value="">Select location</option>
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Social situation (Optional)
          </label>
          <select
            value={socialSituation}
            onChange={(e) => onSocialSituationChange(e.target.value)}
            className={cn(
              "w-full p-2 border border-gray-300 rounded-md",
              isMobile && "min-h-[44px] text-base"
            )}
          >
            <option value="">Select situation</option>
            {SOCIAL_SITUATION_OPTIONS.map((situation) => (
              <option key={situation} value={situation}>{situation}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Additional notes (Optional)
        </label>
        <Textarea
          placeholder="Any additional thoughts or context..."
          value={notes}
          onChange={handleNotesChange}
          className={cn("resize-none", isMobile ? "min-h-[60px] text-base" : "min-h-[80px]")}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${remainingCharacters < 50 ? 'text-amber-600' : 'text-gray-500'}`}>
            {remainingCharacters} characters remaining
          </span>
          {remainingCharacters < 0 && (
            <span className="text-xs text-red-600">
              Exceeded limit by {Math.abs(remainingCharacters)} characters
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextCapture;
