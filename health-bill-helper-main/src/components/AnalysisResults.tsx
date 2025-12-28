import { AlertTriangle, CheckCircle, DollarSign, FileDown, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult, Issue } from '@/lib/api/billAnalysis';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const severityConfig = {
  high: {
    color: 'bg-error/10 text-error border-error/20',
    icon: AlertTriangle,
    label: 'High Priority',
  },
  medium: {
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: AlertCircle,
    label: 'Medium Priority',
  },
  low: {
    color: 'bg-muted text-muted-foreground border-border',
    icon: Info,
    label: 'Low Priority',
  },
};

const issueTypeLabels: Record<Issue['type'], string> = {
  overcharge: 'Overcharge',
  duplicate: 'Duplicate Charge',
  missing_code: 'Missing Code',
  unbundling: 'Unbundling',
  upcoding: 'Upcoding',
  balance_billing: 'Balance Billing',
};

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const handleDownloadLetter = () => {
    if (!result.disputeLetterContent) return;
    
    const blob = new Blob([result.disputeLetterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dispute-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasIssues = result.issues.length > 0;
  const highPriorityIssues = result.issues.filter(i => i.severity === 'high');
  const mediumPriorityIssues = result.issues.filter(i => i.severity === 'medium');
  const lowPriorityIssues = result.issues.filter(i => i.severity === 'low');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onReset}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Bill Analysis Complete
          </h2>
          {result.hospitalName && (
            <p className="text-muted-foreground">{result.hospitalName}</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="text-2xl font-semibold text-foreground">
                  ${result.totalBilled?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "gradient-card",
          hasIssues ? "ring-2 ring-warning/30" : "ring-2 ring-success/30"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                hasIssues ? "bg-warning/10" : "bg-success/10"
              )}>
                {hasIssues ? (
                  <AlertTriangle className="h-6 w-6 text-warning" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-success" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-semibold text-foreground">
                  {result.issues.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "gradient-card",
          result.potentialSavings > 0 && "ring-2 ring-success/30"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-semibold text-success">
                  ${result.potentialSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {hasIssues ? (
        <div className="space-y-6">
          <h3 className="text-xl font-display font-semibold text-foreground">
            Flagged Issues
          </h3>
          
          {[...highPriorityIssues, ...mediumPriorityIssues, ...lowPriorityIssues].map((issue, index) => {
            const config = severityConfig[issue.severity];
            const Icon = config.icon;
            
            return (
              <Card 
                key={index} 
                className={cn("overflow-hidden animate-slide-up", `border-l-4`)}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  borderLeftColor: issue.severity === 'high' 
                    ? 'hsl(var(--error))' 
                    : issue.severity === 'medium' 
                      ? 'hsl(var(--warning))' 
                      : 'hsl(var(--muted-foreground))'
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          <Badge variant="secondary">
                            {issueTypeLabels[issue.type]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {issue.potentialSavings && issue.potentialSavings > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Potential Savings</p>
                        <p className="text-lg font-semibold text-success">
                          ${issue.potentialSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{issue.description}</p>
                  
                  {issue.lineItem && (
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.lineItem.description}</p>
                        <p className="text-xs text-muted-foreground">Code: {issue.lineItem.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${issue.lineItem.amount.toLocaleString()}</p>
                        {issue.referencePrice && (
                          <p className="text-xs text-muted-foreground">
                            Fair price: ${issue.referencePrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium text-primary">Recommendation</p>
                    <p className="text-sm text-foreground mt-1">{issue.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Issues Found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We analyzed your bill and didn't find any obvious billing errors or overcharges. 
              Your charges appear to be within normal ranges.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dispute Letter Section */}
      {result.disputeLetterContent && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-primary" />
              Dispute Letter Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We've drafted a professional dispute letter citing all flagged issues and 
              relevant patient rights including the No Surprises Act. Download and customize 
              it with your personal details before sending to the hospital's billing department.
            </p>
            
            <div className="p-4 rounded-lg bg-secondary/50 max-h-64 overflow-y-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                {result.disputeLetterContent}
              </pre>
            </div>
            
            <Button onClick={handleDownloadLetter} size="lg" className="w-full">
              <FileDown className="h-5 w-5 mr-2" />
              Download Dispute Letter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      {result.lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Line Items ({result.lineItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Code</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lineItems.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-2 font-mono text-xs">{item.code}</td>
                      <td className="py-3 px-2">{item.description}</td>
                      <td className="py-3 px-2 text-right">{item.quantity || 1}</td>
                      <td className="py-3 px-2 text-right font-medium">
                        ${item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="text-center pt-4">
        <Button variant="outline" onClick={onReset}>
          Analyze Another Bill
        </Button>
      </div>
    </div>
  );
}
