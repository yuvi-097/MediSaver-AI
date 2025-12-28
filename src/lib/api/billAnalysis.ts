import { supabase } from '@/integrations/supabase/client';

export interface LineItem {
  code: string;
  description: string;
  amount: number;
  quantity?: number;
}

export interface Issue {
  type: 'overcharge' | 'duplicate' | 'missing_code' | 'unbundling' | 'upcoding' | 'balance_billing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings?: number;
  recommendation: string;
  lineItem?: LineItem;
  referencePrice?: number;
}

export interface AnalysisResult {
  success: boolean;
  hospitalName?: string;
  hospitalAddress?: string;
  patientInfo?: string;
  dateOfService?: string;
  totalBilled?: number;
  lineItems: LineItem[];
  issues: Issue[];
  potentialSavings: number;
  disputeLetterContent?: string;
  error?: string;
}

export async function analyzeBill(billText: string, fileName?: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-bill', {
    body: { billText, fileName },
  });

  if (error) {
    console.error('Error analyzing bill:', error);
    return {
      success: false,
      lineItems: [],
      issues: [],
      potentialSavings: 0,
      error: error.message || 'Failed to analyze bill',
    };
  }

  return data as AnalysisResult;
}

export async function uploadBillToStorage(file: File): Promise<{ path: string; error?: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('bills')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading bill:', error);
    return { path: '', error: error.message };
  }

  return { path: data.path };
}
