import { Button } from "@/components/ui/button";
import { Plus, Search, MapIcon, Sparkles } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2 border-white text-white hover:bg-white/10"
            data-testid="button-action-discover"
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-medium">Discover</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2 border-white text-white hover:bg-white/10"
            data-testid="button-action-search"
          >
            <Search className="w-6 h-6" />
            <span className="text-sm font-medium">Search</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2 border-white text-white hover:bg-white/10"
            data-testid="button-action-map"
          >
            <MapIcon className="w-6 h-6" />
            <span className="text-sm font-medium">Map View</span>
          </Button>
          
          <Button
            className="h-auto py-6 flex-col gap-2 bg-white text-black hover:bg-white"
            data-testid="button-action-create"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Create Event</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
