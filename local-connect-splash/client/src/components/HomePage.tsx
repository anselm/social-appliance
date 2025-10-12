import { useState, useEffect } from "react";
import HomeHeader from "@/components/HomeHeader";
import QuickActions from "@/components/QuickActions";
import ActivityCard from "@/components/ActivityCard";
import OnboardingModal from "@/components/OnboardingModal";
import eventImage from "@assets/stock_images/local_event_live_mus_c05a9709.jpg";
import groupImage from "@assets/stock_images/community_group_gath_93e7e52c.jpg";
import cafeImage from "@assets/stock_images/friends_meeting_at_l_81e65481.jpg";
import streetImage from "@assets/stock_images/people_exploring_loc_48b1d4aa.jpg";

//todo: remove mock functionality
const mockActivities = [
  {
    id: "1",
    title: "Underground Comedy Show",
    type: "event" as const,
    image: eventImage,
    location: "The Basement",
    distance: "0.4 mi",
    time: "Tonight, 9 PM",
    groupSize: 15,
    maxGroupSize: 30,
    tags: ["Comedy", "Nightlife", "BYOB"],
  },
  {
    id: "2",
    title: "Rooftop Yoga at Sunrise",
    type: "activity" as const,
    image: groupImage,
    location: "Central Building",
    distance: "0.6 mi",
    time: "Tomorrow, 6 AM",
    groupSize: 8,
    maxGroupSize: 12,
    tags: ["Fitness", "Wellness", "Outdoors"],
  },
  {
    id: "3",
    title: "Vinyl Record Shop & Cafe",
    type: "place" as const,
    image: cafeImage,
    location: "Arts District",
    distance: "0.9 mi",
    groupSize: 23,
    tags: ["Music", "Coffee", "Vintage"],
  },
  {
    id: "4",
    title: "Street Food Night Market",
    type: "event" as const,
    image: streetImage,
    location: "River Walk",
    distance: "1.1 mi",
    time: "Friday-Sunday, 6-11 PM",
    groupSize: 45,
    tags: ["Food", "Culture", "Family Friendly"],
  },
  {
    id: "5",
    title: "Indie Bookstore Poetry Reading",
    type: "event" as const,
    image: cafeImage,
    location: "Pages & Co",
    distance: "0.3 mi",
    time: "This Thursday, 7 PM",
    groupSize: 10,
    maxGroupSize: 25,
    tags: ["Books", "Poetry", "Arts"],
  },
  {
    id: "6",
    title: "Morning Trail Run Group",
    type: "activity" as const,
    image: groupImage,
    location: "Riverside Park",
    distance: "1.5 mi",
    time: "Every Wed & Sat, 7 AM",
    groupSize: 12,
    tags: ["Fitness", "Outdoors", "Social"],
  },
];

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(true); //todo: remove mock functionality - check if user has completed onboarding
  const [userType, setUserType] = useState("");
  const [userInterests, setUserInterests] = useState<string[]>([]);

  const handleOnboardingComplete = (type: string, interests: string[]) => {
    setUserType(type);
    setUserInterests(interests);
    setShowOnboarding(false);
    console.log("User onboarded:", { type, interests });
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <QuickActions />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2" data-testid="text-happening-title">
            Happening Right Now
          </h2>
          <p className="text-muted-foreground" data-testid="text-happening-subtitle">
            Activities and places your community is into
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockActivities.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 border border-border hover-elevate text-sm" data-testid="button-filter-today">
              Happening Today
            </button>
            <button className="px-4 py-2 border border-border hover-elevate text-sm" data-testid="button-filter-weekend">
              This Weekend
            </button>
            <button className="px-4 py-2 border border-border hover-elevate text-sm" data-testid="button-filter-groups">
              Active Groups
            </button>
          </div>
        </div>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
