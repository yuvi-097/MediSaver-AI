import { useState, useCallback } from 'react';
import { Upload, FileText, Image, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BillUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function BillUploader({ onFileSelect, isProcessing }: BillUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const isValidFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    return validTypes.includes(file.type);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-primary" />;
    }
    return <Image className="h-8 w-8 text-primary" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer",
            "hover:border-primary/50 hover:bg-secondary/30",
            dragActive 
              ? "border-primary bg-secondary/50 scale-[1.02]" 
              : "border-border bg-card"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              "p-4 rounded-full transition-all duration-300",
              dragActive ? "bg-primary/20" : "bg-secondary"
            )}>
              <Upload className={cn(
                "h-10 w-10 transition-colors",
                dragActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground">
                Drop your hospital bill here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse your files
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>PDF</span>
              <span className="text-border">•</span>
              <Image className="h-4 w-4" />
              <span>PNG, JPG, WebP</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-card shadow-elegant animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-secondary">
              {getFileIcon(selectedFile)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            {!isProcessing && (
              <button
                onClick={clearFile}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isProcessing}
            className="w-full mt-6"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing your bill...
              </>
            ) : (
              'Analyze Bill for Errors'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
