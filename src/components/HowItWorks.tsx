import { Upload, Search, FileText, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Bill',
    description: 'Drop your hospital bill as a PDF or image. We accept itemized statements, EOBs, and summary bills.',
  },
  {
    icon: Search,
    title: 'AI Analysis',
    description: 'Our AI extracts line items, identifies CPT codes, and compares charges against Medicare benchmarks.',
  },
  {
    icon: FileText,
    title: 'Get Results',
    description: 'See flagged issues in plain language: overcharges, duplicates, and billing violations.',
  },
  {
    icon: Download,
    title: 'Download Letter',
    description: 'Get a professional dispute letter citing relevant laws, ready to send to the hospital.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-display font-semibold text-center text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Three simple steps to check your bill and dispute any errors
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-secondary mb-4 relative">
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
