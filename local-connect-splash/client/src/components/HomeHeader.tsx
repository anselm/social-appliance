import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-xl font-display font-bold" data-testid="text-header-brand">
              Connect
            </h1>
            <p className="text-xs text-muted-foreground" data-testid="text-header-location">
              Downtown · 0.5 mi radius
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-profile">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 pb-4 overflow-x-auto">
          <Badge variant="default" className="cursor-pointer" data-testid="badge-filter-all">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-filter-today">
            Today
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-filter-events">
            Events
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-filter-places">
            Places
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-filter-groups">
            Groups
          </Badge>
        </div>
      </div>
    </header>
  );
}
