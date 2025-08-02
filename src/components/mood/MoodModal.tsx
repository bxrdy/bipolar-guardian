import { useState } from 'react';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogBody, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MoodSelector from './MoodSelector';
import AdditionalMetrics from './AdditionalMetrics';
import ContextCapture from './ContextCapture';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalMode?: boolean;
}

const MoodModal = ({ isOpen, onClose, journalMode = false }: MoodModalProps) => {
  const isMobile = useIsMobile();
  const [mood, setMood] = useState(journalMode ? 5 : 7);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [anxiety, setAnxiety] = useState(3);
  const [activities, setActivities] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [socialSituation, setSocialSituation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const maxCharacters = 500;
  const remainingCharacters = maxCharacters - notes.length;

  const handleSubmit = async () => {
    if (journalMode && !notes.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    if (notes.length > maxCharacters) {
      toast.error(`Notes must be ${maxCharacters} characters or less`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Please log in to save your entry');
        return;
      }

      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood,
          energy,
          stress,
          anxiety,
          activities: activities.length > 0 ? activities : null,
          location: location || null,
          social_situation: socialSituation || null,
          notes: notes.trim() || null,
        });

      if (error) {
        console.error('Error saving mood entry:', error);
        toast.error(journalMode ? 'Failed to save journal entry' : 'Failed to save mood entry');
      } else {
        toast.success(journalMode ? 'Journal entry saved successfully' : 'Mood entry saved successfully');
        handleClose();
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      toast.error(journalMode ? 'Failed to save journal entry' : 'Failed to save mood entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMood(journalMode ? 5 : 7);
    setEnergy(3);
    setStress(3);
    setAnxiety(3);
    setActivities([]);
    setLocation('');
    setSocialSituation('');
    setNotes('');
    setShowAdditionalDetails(false);
    setShowContext(false);
    onClose();
  };

  return (
    <MobileDialog open={isOpen} onOpenChange={handleClose}>
      <MobileDialogContent className={cn(
        isMobile ? "w-[calc(100vw-2rem)]" : "max-w-2xl w-full"
      )}>
        <MobileDialogHeader>
          <MobileDialogTitle>
            {journalMode ? 'Journal Your Feelings' : 'How are you feeling?'}
          </MobileDialogTitle>
        </MobileDialogHeader>
        
        <MobileDialogBody>
          <div className="space-y-6">
            {journalMode ? (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Take a moment to reflect on how you're feeling right now. Writing down your thoughts can help process emotions and track patterns over time.
                  </p>
                  <ContextCapture
                    notes={notes}
                    onNotesChange={setNotes}
                    activities={activities}
                    onActivitiesChange={setActivities}
                    location={location}
                    onLocationChange={setLocation}
                    socialSituation={socialSituation}
                    onSocialSituationChange={setSocialSituation}
                    journalMode={true}
                  />
                  <div className="flex justify-between items-center mt-2">
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
                
                <Collapsible open={showAdditionalDetails} onOpenChange={setShowAdditionalDetails}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between",
                        isMobile && "min-h-[48px]"
                      )}
                    >
                      Optional: Add mood details
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        showAdditionalDetails && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-3">
                    <MoodSelector selectedMood={mood} onMoodChange={setMood} />
                    <AdditionalMetrics
                      energy={energy}
                      stress={stress}
                      anxiety={anxiety}
                      onEnergyChange={setEnergy}
                      onStressChange={setStress}
                      onAnxietyChange={setAnxiety}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : (
              <>
                <MoodSelector selectedMood={mood} onMoodChange={setMood} />
                
                <Collapsible open={showAdditionalDetails} onOpenChange={setShowAdditionalDetails}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between",
                        isMobile && "min-h-[48px]"
                      )}
                    >
                      Additional Details
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        showAdditionalDetails && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <AdditionalMetrics
                      energy={energy}
                      stress={stress}
                      anxiety={anxiety}
                      onEnergyChange={setEnergy}
                      onStressChange={setStress}
                      onAnxietyChange={setAnxiety}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={showContext} onOpenChange={setShowContext}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between",
                        isMobile && "min-h-[48px]"
                      )}
                    >
                      Context & Notes
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        showContext && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <ContextCapture
                      notes={notes}
                      onNotesChange={setNotes}
                      activities={activities}
                      onActivitiesChange={setActivities}
                      location={location}
                      onLocationChange={setLocation}
                      socialSituation={socialSituation}
                      onSocialSituationChange={setSocialSituation}
                      journalMode={false}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </div>
        </MobileDialogBody>
          
        <MobileDialogFooter>
          <div className={cn("flex", isMobile ? "flex-col space-y-3" : "justify-end space-x-2")}>
            <Button 
              variant="outline" 
              onClick={handleClose}
              className={isMobile ? "w-full min-h-[48px]" : ""}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (journalMode && !notes.trim()) || notes.length > maxCharacters}
              className={isMobile ? "w-full min-h-[48px]" : ""}
            >
              {isSubmitting ? 'Saving...' : (journalMode ? 'Save Entry' : 'Save Mood')}
            </Button>
          </div>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default MoodModal;
