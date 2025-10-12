import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userType: string, interests: string[]) => void;
}

const userTypes = [
  { id: "explorer", label: "I want inspiration", description: "Show me what's happening" },
  { id: "seeker", label: "I know what I want", description: "Help me find it" },
  { id: "organizer", label: "I want to host", description: "Create events & activities" },
];

const interests = [
  "Food & Drinks", "Live Music", "Sports & Fitness", "Arts & Culture", 
  "Outdoor Adventures", "Tech & Gaming", "Books & Learning", "Nightlife"
];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleComplete = () => {
    onComplete(selectedType, selectedInterests);
    console.log("Onboarding complete:", { selectedType, selectedInterests });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" data-testid="modal-onboarding">
      <div className="bg-background max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold" data-testid="text-modal-title">
            {step === 1 ? "What brings you here?" : "What are you into?"}
          </h2>
          <button onClick={onClose} data-testid="button-close-modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              {userTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left p-6 border-2 transition-all hover-elevate ${
                    selectedType === type.id 
                      ? 'border-foreground bg-muted' 
                      : 'border-border'
                  }`}
                  data-testid={`button-usertype-${type.id}`}
                >
                  <div className="font-bold text-lg mb-1">{type.label}</div>
                  <div className="text-muted-foreground text-sm">{type.description}</div>
                </button>
              ))}
              <Button 
                size="lg" 
                className="w-full mt-6" 
                disabled={!selectedType}
                onClick={() => setStep(2)}
                data-testid="button-next-step"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-muted-foreground">Select at least 3 to personalize your feed</p>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-4 border-2 text-sm font-medium transition-all hover-elevate ${
                      selectedInterests.includes(interest)
                        ? 'border-foreground bg-muted'
                        : 'border-border'
                    }`}
                    data-testid={`button-interest-${interest.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1"
                  disabled={selectedInterests.length < 3}
                  onClick={handleComplete}
                  data-testid="button-complete"
                >
                  Get Started ({selectedInterests.length}/3)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
