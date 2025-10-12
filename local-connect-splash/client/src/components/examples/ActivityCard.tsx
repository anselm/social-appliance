import ActivityCard from '../ActivityCard';

export default function ActivityCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <ActivityCard
        id="1"
        title="Secret Jazz Night at The Vault"
        type="event"
        location="Downtown"
        distance="0.3 mi"
        time="Tonight, 8 PM"
        groupSize={12}
        maxGroupSize={20}
        tags={["Live Music", "Jazz", "Drinks"]}
      />
      <ActivityCard
        id="2"
        title="Hidden Garden Coffee Shop"
        type="place"
        location="Eastside"
        distance="0.8 mi"
        groupSize={5}
        tags={["Coffee", "Cozy", "WiFi"]}
      />
      <ActivityCard
        id="3"
        title="Morning Trail Run"
        type="activity"
        location="Riverside Park"
        distance="1.2 mi"
        time="Tomorrow, 7 AM"
        groupSize={8}
        maxGroupSize={15}
        tags={["Fitness", "Outdoors", "Beginner Friendly"]}
        isCheckedIn={true}
      />
    </div>
  );
}
