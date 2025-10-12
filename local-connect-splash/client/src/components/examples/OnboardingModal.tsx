import OnboardingModal from '../OnboardingModal';
import { useState } from 'react';

export default function OnboardingModalExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <OnboardingModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)}
      onComplete={(type, interests) => {
        console.log('Completed:', type, interests);
        setIsOpen(false);
      }}
    />
  );
}
