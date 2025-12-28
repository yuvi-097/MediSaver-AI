import { Shield, Lock, Eye } from 'lucide-react';

const badges = [
  {
    icon: Lock,
    title: 'Secure Upload',
    description: 'Your files are encrypted in transit',
  },
  {
    icon: Eye,
    title: 'No Data Stored',
    description: 'Bills are processed and deleted',
  },
  {
    icon: Shield,
    title: 'No Login Required',
    description: 'Use instantly, no account needed',
  },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-8">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div 
            key={index} 
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/50 border border-border animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Icon className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
