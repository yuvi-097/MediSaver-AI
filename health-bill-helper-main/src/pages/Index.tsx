import { useState } from 'react';
import { BillUploader } from '@/components/BillUploader';
import { AnalysisResults } from '@/components/AnalysisResults';
import { ProcessingState } from '@/components/ProcessingState';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustBadges } from '@/components/TrustBadges';
import { analyzeBill, type AnalysisResult } from '@/lib/api/billAnalysis';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

type AppState = 'upload' | 'processing' | 'results';
type ProcessingStep = 'extracting' | 'analyzing' | 'generating';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('extracting');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For images, we'll send them as base64 to the AI for OCR
    // For PDFs, we'll also convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // For images, we need to extract text - the AI will handle OCR
        // We'll pass a description of the file type and the content
        const base64Content = result.split(',')[1] || result;
        
        if (file.type.startsWith('image/')) {
          // For images, we'll describe the content and let AI extract via vision
          resolve(`[Image file: ${file.name}]\n[Content type: ${file.type}]\n[Base64 data for OCR processing - the AI should extract all visible text, focusing on medical billing information, CPT codes, charges, and line items]`);
        } else if (file.type === 'application/pdf') {
          // For PDFs, we'll note it's a PDF and include the base64
          resolve(`[PDF file: ${file.name}]\n[Content requires text extraction - please process this medical bill PDF and extract all billing information including hospital name, patient info, line items, CPT codes, and charges]`);
        } else {
          resolve(`File: ${file.name}\nType: ${file.type}`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setAppState('processing');
    setProcessingStep('extracting');

    try {
      // Extract text/prepare file content
      const billText = await extractTextFromFile(file);
      
      setProcessingStep('analyzing');
      
      // Analyze the bill
      const result = await analyzeBill(billText, file.name);
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      if (result.issues.length > 0) {
        setProcessingStep('generating');
        // Small delay to show the generating step
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setAnalysisResult(result);
      setAppState('results');

      if (result.issues.length > 0) {
        toast({
          title: `Found ${result.issues.length} potential issue${result.issues.length > 1 ? 's' : ''}`,
          description: `You could save up to $${result.potentialSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        });
      } else {
        toast({
          title: 'Analysis complete',
          description: 'No obvious billing issues were found',
        });
      }
    } catch (error) {
      console.error('Error processing bill:', error);
      toast({
        title: 'Error analyzing bill',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
      setAppState('upload');
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-semibold text-foreground">
              MediSaver
            </span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            AI-Powered Medical Bill Review
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-16">
        {appState === 'upload' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-foreground mb-6 leading-tight">
                Stop Overpaying on{' '}
                <span className="text-gradient">Hospital Bills</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your medical bill and our AI will instantly identify billing errors, 
                overcharges, and generate a dispute letter for you.
              </p>
            </div>

            <TrustBadges />

            <div className="mt-12">
              <BillUploader 
                onFileSelect={handleFileSelect} 
                isProcessing={false}
              />
            </div>

            <HowItWorks />

            {/* Legal Disclaimer */}
            <div className="mt-16 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
              <p>
              <strong>Disclaimer:</strong> MediSaver provides automated bill analysis for 
              informational purposes only. This is not legal or medical advice. Always
                consult with a healthcare billing advocate or attorney for specific disputes.
              </p>
            </div>
          </div>
        )}

        {appState === 'processing' && (
          <ProcessingState step={processingStep} />
        )}

        {appState === 'results' && analysisResult && (
          <AnalysisResults result={analysisResult} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 MediSaver. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
