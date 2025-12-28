import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LineItem {
  code: string;
  description: string;
  amount: number;
  quantity?: number;
}

interface Issue {
  type: 'overcharge' | 'duplicate' | 'missing_code' | 'unbundling' | 'upcoding' | 'balance_billing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings?: number;
  recommendation: string;
  lineItem?: LineItem;
  referencePrice?: number;
}

interface AnalysisResult {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { billText, fileName } = await req.json();

    if (!billText) {
      return new Response(
        JSON.stringify({ success: false, error: 'No bill text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client to fetch reference pricing
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch reference pricing data
    const { data: referencePricing, error: pricingError } = await supabase
      .from('reference_pricing')
      .select('*');

    if (pricingError) {
      console.error('Error fetching reference pricing:', pricingError);
    }

    const pricingContext = referencePricing?.map(p => 
      `CPT ${p.cpt_code}: ${p.procedure_name} | Medicare: $${p.medicare_rate} | Typical Range: $${p.typical_range_low}-$${p.typical_range_high}`
    ).join('\n') || '';

    console.log('Analyzing bill with AI...');

    // First, extract structured data from the bill
    const extractionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a medical billing expert. Extract structured information from hospital bills.

REFERENCE PRICING DATA (Medicare rates and typical ranges):
${pricingContext}

Extract the following from the bill text:
1. Hospital name and address
2. Patient information (name if visible, but omit sensitive details)
3. Date of service
4. Total amount billed
5. All line items with: CPT/procedure code, description, amount charged, quantity

Return ONLY valid JSON in this exact format:
{
  "hospitalName": "string or null",
  "hospitalAddress": "string or null", 
  "patientInfo": "string or null",
  "dateOfService": "string or null",
  "totalBilled": number or null,
  "lineItems": [
    {"code": "string", "description": "string", "amount": number, "quantity": number}
  ]
}`
          },
          {
            role: 'user',
            content: `Extract structured data from this medical bill:\n\n${billText}`
          }
        ],
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.error('AI extraction error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to analyze bill content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractionData = await extractionResponse.json();
    let extractedContent = extractionData.choices?.[0]?.message?.content || '';
    
    // Clean up the response - remove markdown code blocks if present
    extractedContent = extractedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let extracted;
    try {
      extracted = JSON.parse(extractedContent);
    } catch (e) {
      console.error('Failed to parse extraction response:', extractedContent);
      extracted = { lineItems: [] };
    }

    console.log('Extracted data:', JSON.stringify(extracted, null, 2));

    // Now analyze for billing issues
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a medical billing auditor who identifies billing errors and overcharges. Analyze medical bills and identify issues.

REFERENCE PRICING DATA (Medicare rates and typical ranges):
${pricingContext}

Common billing issues to look for:
1. OVERCHARGE: Amount significantly above typical range (more than 200% of high end)
2. DUPLICATE: Same procedure billed multiple times inappropriately
3. UNBUNDLING: Separate billing for procedures that should be billed together
4. UPCODING: Billing for more expensive procedure than performed
5. BALANCE BILLING: Charges that may violate No Surprises Act
6. MISSING_CODE: Services without proper CPT codes

For each issue found, provide:
- Type of issue
- Severity (high/medium/low based on potential savings)
- Clear title
- Plain-language description
- Estimated savings if disputed
- Specific recommendation

Return ONLY valid JSON in this exact format:
{
  "issues": [
    {
      "type": "overcharge|duplicate|missing_code|unbundling|upcoding|balance_billing",
      "severity": "high|medium|low",
      "title": "string",
      "description": "string",
      "potentialSavings": number,
      "recommendation": "string",
      "lineItem": {"code": "string", "description": "string", "amount": number},
      "referencePrice": number or null
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Analyze this medical bill for errors and overcharges:

Hospital: ${extracted.hospitalName || 'Unknown'}
Total Billed: $${extracted.totalBilled || 'Unknown'}
Line Items:
${JSON.stringify(extracted.lineItems || [], null, 2)}

Original Bill Text:
${billText}`
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('AI analysis error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to analyze billing issues' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisData = await analysisResponse.json();
    let analysisContent = analysisData.choices?.[0]?.message?.content || '';
    analysisContent = analysisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(analysisContent);
    } catch (e) {
      console.error('Failed to parse analysis response:', analysisContent);
      analysis = { issues: [] };
    }

    console.log('Analysis results:', JSON.stringify(analysis, null, 2));

    const issues: Issue[] = analysis.issues || [];
    const potentialSavings = issues.reduce((sum, issue) => sum + (issue.potentialSavings || 0), 0);

    // Generate dispute letter if there are issues
    let disputeLetterContent = '';
    if (issues.length > 0) {
      const letterResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a patient advocate drafting professional medical billing dispute letters. Write formal but assertive letters that cite relevant laws and patient rights.

Key laws to reference when applicable:
- No Surprises Act (2022): Protects against balance billing for emergency services and certain out-of-network care
- Fair Debt Collection Practices Act
- State patient billing rights
- Hospital charity care policies

The letter should be professional, clear, and actionable.`
            },
            {
              role: 'user',
              content: `Generate a formal dispute letter for these billing issues:

Hospital: ${extracted.hospitalName || '[HOSPITAL NAME]'}
Hospital Address: ${extracted.hospitalAddress || '[HOSPITAL ADDRESS]'}
Date of Service: ${extracted.dateOfService || '[DATE OF SERVICE]'}
Total Billed: $${extracted.totalBilled || '[TOTAL AMOUNT]'}

Issues Found:
${issues.map((issue, i) => `
${i + 1}. ${issue.title}
   - Type: ${issue.type}
   - Description: ${issue.description}
   - Amount in Question: $${issue.lineItem?.amount || 'N/A'}
   - Reference/Fair Price: $${issue.referencePrice || 'N/A'}
   - Potential Savings: $${issue.potentialSavings || 0}
`).join('\n')}

Total Potential Savings: $${potentialSavings.toFixed(2)}

Write a professional dispute letter that:
1. Clearly states this is a formal billing dispute
2. Lists each issue with specific amounts
3. Cites relevant patient rights (No Surprises Act, etc.)
4. Requests itemized bill review
5. Requests billing adjustment
6. Includes placeholders for patient name, address, account number
7. Has professional closing

Format as a complete letter ready to print and send.`
            }
          ],
        }),
      });

      if (letterResponse.ok) {
        const letterData = await letterResponse.json();
        disputeLetterContent = letterData.choices?.[0]?.message?.content || '';
      }
    }

    const result: AnalysisResult = {
      success: true,
      hospitalName: extracted.hospitalName,
      hospitalAddress: extracted.hospitalAddress,
      patientInfo: extracted.patientInfo,
      dateOfService: extracted.dateOfService,
      totalBilled: extracted.totalBilled,
      lineItems: extracted.lineItems || [],
      issues,
      potentialSavings,
      disputeLetterContent,
    };

    console.log('Analysis complete. Issues found:', issues.length);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing bill:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
