import { FileSearch, Brain, FileCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStateProps {
  step: 'extracting' | 'analyzing' | 'generating';
}

const steps = [
  {
    id: 'extracting',
    label: 'Extracting text from your bill',
    icon: FileSearch,
  },
  {
    id: 'analyzing',
    label: 'Analyzing charges & identifying issues',
    icon: Brain,
  },
  {
    id: 'generating',
    label: 'Generating dispute letter',
    icon: FileCheck,
  },
];

export function ProcessingState({ step }: ProcessingStateProps) {
  const currentIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="w-full max-w-lg mx-auto py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">
          Analyzing Your Bill
        </h3>
        <p className="text-muted-foreground mt-1">
          This usually takes about 15-30 seconds
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                isActive && "bg-primary/5 ring-1 ring-primary/20",
                isComplete && "bg-success/5",
                !isActive && !isComplete && "opacity-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive && "bg-primary/10",
                isComplete && "bg-success/10",
                !isActive && !isComplete && "bg-muted"
              )}>
                {isActive ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Icon className={cn(
                    "h-5 w-5",
                    isComplete ? "text-success" : "text-muted-foreground"
                  )} />
                )}
              </div>
              <span className={cn(
                "font-medium",
                isActive && "text-foreground",
                isComplete && "text-success",
                !isActive && !isComplete && "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
