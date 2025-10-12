import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Check } from "lucide-react";
import { useState } from "react";

interface ActivityCardProps {
  id: string;
  title: string;
  type: "event" | "place" | "activity";
  image?: string;
  location: string;
  distance: string;
  time?: string;
  groupSize?: number;
  maxGroupSize?: number;
  tags: string[];
  isCheckedIn?: boolean;
}

export default function ActivityCard({
  id,
  title,
  type,
  image,
  location,
  distance,
  time,
  groupSize,
  maxGroupSize,
  tags,
  isCheckedIn: initialCheckedIn = false
}: ActivityCardProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(initialCheckedIn);

  const handleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
    console.log(`Check-in toggled for ${title}:`, !isCheckedIn);
  };

  return (
    <div className="border border-border bg-card hover-elevate transition-transform" data-testid={`card-activity-${id}`}>
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover grayscale contrast-110"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-xs uppercase" data-testid={`badge-type-${id}`}>
              {type}
            </Badge>
          </div>
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg leading-tight" data-testid={`text-title-${id}`}>
          {title}
        </h3>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2" data-testid={`text-location-${id}`}>
            <MapPin className="w-4 h-4" />
            <span>{location} · {distance}</span>
          </div>
          
          {time && (
            <div className="flex items-center gap-2" data-testid={`text-time-${id}`}>
              <Clock className="w-4 h-4" />
              <span>{time}</span>
            </div>
          )}
          
          {groupSize !== undefined && (
            <div className="flex items-center gap-2" data-testid={`text-group-${id}`}>
              <Users className="w-4 h-4" />
              <span>{groupSize}{maxGroupSize ? `/${maxGroupSize}` : '+'} people interested</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs"
              data-testid={`badge-tag-${id}-${index}`}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant={isCheckedIn ? "default" : "outline"}
            onClick={handleCheckIn}
            className="flex-1"
            data-testid={`button-checkin-${id}`}
          >
            {isCheckedIn ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Checked In
              </>
            ) : (
              "Check In"
            )}
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            data-testid={`button-details-${id}`}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
