import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface DummyDocumentGeneratorProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DummyDocumentGenerator = ({ isLoading, setIsLoading }: DummyDocumentGeneratorProps) => {
  const [documentType, setDocumentType] = useState<string>('');
  const [customText, setCustomText] = useState('');
  const [generatedDocuments, setGeneratedDocuments] = useState<Array<{
    id: string;
    type: string;
    content: string;
    timestamp: string;
  }>>([]);

  const documentTemplates = {
    'lab-report': {
      name: 'Lab Report',
      template: `LABORATORY REPORT
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Provider: Central Medical Laboratory

LIPID PANEL
Total Cholesterol: 185 mg/dL (Normal: <200)
LDL Cholesterol: 110 mg/dL (Normal: <100)
HDL Cholesterol: 45 mg/dL (Normal: >40)
Triglycerides: 150 mg/dL (Normal: <150)

LIVER FUNCTION
ALT: 28 U/L (Normal: 10-40)
AST: 32 U/L (Normal: 10-40)
Bilirubin: 0.8 mg/dL (Normal: 0.3-1.2)

THYROID FUNCTION
TSH: 2.1 mIU/L (Normal: 0.4-4.0)
Free T4: 1.2 ng/dL (Normal: 0.8-1.8)

MOOD STABILIZER MONITORING
Lithium Level: 0.8 mEq/L (Therapeutic: 0.6-1.2)
Valproic Acid: 75 μg/mL (Therapeutic: 50-100)

Notes: Patient stable on current bipolar medication regimen. Continue monitoring lithium levels quarterly.`
    },
    'psychiatrist-note': {
      name: 'Psychiatrist Note',
      template: `PSYCHIATRIC CONSULTATION NOTE
Patient: Jane Smith
Date: ${new Date().toLocaleDateString()}
Provider: Dr. Sarah Johnson, MD

CHIEF COMPLAINT:
Follow-up for bipolar disorder, medication management

CURRENT MEDICATIONS:
- Lithium 900mg daily
- Lamotrigine 200mg daily
- Aripiprazole 10mg daily

MENTAL STATUS EXAM:
Appearance: Well-groomed, appropriate dress
Behavior: Cooperative, good eye contact
Speech: Normal rate and volume
Mood: "Stable"
Affect: Euthymic, appropriate
Thought Process: Linear, goal-directed
Thought Content: No delusions, no suicidal ideation
Perceptions: No hallucinations
Cognition: Alert and oriented x3
Insight: Good
Judgment: Intact

ASSESSMENT:
Bipolar I disorder, currently stable on medication regimen. No acute mood episodes in past 6 months. Good medication adherence.

PLAN:
- Continue current medications
- Follow-up in 3 months
- Lab work in 2 weeks for lithium level
- Continue mood tracking daily
- Maintain regular sleep schedule`
    },
    'therapy-note': {
      name: 'Therapy Session Note',
      template: `THERAPY SESSION NOTE
Patient: Michael Brown
Date: ${new Date().toLocaleDateString()}
Therapist: Lisa Chen, LCSW
Session Type: Individual CBT

SESSION SUMMARY:
Patient presented for weekly CBT session. Reports mood stability over past week with mood ratings between 4-6/10. Discussed coping strategies for work stress and relationship challenges.

INTERVENTIONS USED:
- Cognitive restructuring for negative thought patterns
- Behavioral activation planning
- Stress management techniques
- Mood monitoring review

HOMEWORK ASSIGNED:
- Daily mood tracking with triggers
- Practice deep breathing exercises 2x daily
- Complete thought record for work-related stress
- Schedule 2 pleasant activities this week

TREATMENT GOALS PROGRESS:
1. Mood stability: Making progress, fewer mood swings
2. Coping skills: Actively using breathing techniques
3. Social functioning: Improved communication with family

NEXT SESSION:
Continue CBT interventions, review homework, discuss medication adherence with psychiatrist referral if needed.`
    },
    'discharge-summary': {
      name: 'Hospital Discharge Summary',
      template: `HOSPITAL DISCHARGE SUMMARY
Patient: Robert Davis
Admission Date: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Discharge Date: ${new Date().toLocaleDateString()}
Attending: Dr. Emily Rodriguez, MD

ADMISSION DIAGNOSIS:
Bipolar I disorder, manic episode, severe

DISCHARGE DIAGNOSIS:
Bipolar I disorder, manic episode, in partial remission

HOSPITAL COURSE:
Patient admitted for acute manic episode with psychotic features. Presented with elevated mood, decreased sleep, racing thoughts, and grandiose delusions. Treated with mood stabilizers and antipsychotics.

MEDICATIONS ON DISCHARGE:
- Lithium 600mg BID
- Quetiapine 400mg daily
- Lorazepam 1mg BID PRN anxiety

DISCHARGE INSTRUCTIONS:
- Follow-up with psychiatrist in 1 week
- Lab work in 5 days for lithium level
- Continue all medications as prescribed
- No driving until cleared by psychiatrist
- Return to ED if mood symptoms worsen

FOLLOW-UP APPOINTMENTS:
- Psychiatrist: Dr. Johnson, 1 week
- Primary Care: Dr. Smith, 2 weeks
- Lab work: 5 days

CONDITION ON DISCHARGE:
Stable, mood improved, no acute distress`
    },
    'prescription': {
      name: 'Prescription Record',
      template: `PRESCRIPTION RECORD
Patient: Amanda Wilson
DOB: 01/15/1985
Date: ${new Date().toLocaleDateString()}
Prescriber: Dr. Mark Thompson, MD

Rx #1: Lithium Carbonate 300mg
Quantity: 90 tablets
Directions: Take 1 tablet three times daily with food
Refills: 2
Generic substitution: OK

Rx #2: Lamotrigine 25mg
Quantity: 30 tablets
Directions: Take 1 tablet daily, increase as directed
Refills: 0
Generic substitution: OK

Rx #3: Aripiprazole 5mg
Quantity: 30 tablets
Directions: Take 1 tablet daily in morning
Refills: 1
Generic substitution: OK

PATIENT COUNSELING:
- Take lithium with food to reduce stomach upset
- Maintain adequate fluid intake
- Report any signs of lithium toxicity
- Lamotrigine dosing will be titrated slowly
- Monitor for mood changes

Next appointment: 2 weeks for medication review`
    }
  };

  const checkAuthentication = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error('Please sign in to generate medical documents');
      return null;
    }
    return user;
  };

  const generateDocument = async (type: string, content: string) => {
    try {
      setIsLoading(true);
      
      const user = await checkAuthentication();
      if (!user) {
        return;
      }

      const newDocument = {
        id: `doc-${Date.now()}`,
        type,
        content,
        timestamp: new Date().toISOString(),
      };

      // Add to local state for display
      setGeneratedDocuments(prev => [newDocument, ...prev]);
      
      // In a real implementation, this would send to a document processing pipeline
      toast.success(`${documentTemplates[type as keyof typeof documentTemplates]?.name || 'Document'} generated successfully`);
      
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast.error(`Failed to generate document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTemplate = () => {
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }
    
    const template = documentTemplates[documentType as keyof typeof documentTemplates];
    if (template) {
      generateDocument(documentType, template.template);
    }
  };

  const handleGenerateCustom = () => {
    if (!customText.trim()) {
      toast.error('Please enter custom document text');
      return;
    }
    
    generateDocument('custom', customText);
  };

  const clearDocuments = () => {
    setGeneratedDocuments([]);
    toast.success('Document history cleared');
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Medical Document Generator</h3>
        <p className="text-xs text-gray-500">Generate realistic medical documents for testing document processing pipelines</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Template Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab-report">Lab Report</SelectItem>
                  <SelectItem value="psychiatrist-note">Psychiatrist Note</SelectItem>
                  <SelectItem value="therapy-note">Therapy Session Note</SelectItem>
                  <SelectItem value="discharge-summary">Hospital Discharge Summary</SelectItem>
                  <SelectItem value="prescription">Prescription Record</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleGenerateTemplate}
                disabled={isLoading || !documentType}
                className="w-full"
              >
                Generate Template Document
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custom Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Enter custom medical document text..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="min-h-[100px]"
              />
              
              <Button 
                onClick={handleGenerateCustom}
                disabled={isLoading || !customText.trim()}
                className="w-full"
                variant="outline"
              >
                Generate Custom Document
              </Button>
            </CardContent>
          </Card>
        </div>

        {generatedDocuments.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Generated Documents ({generatedDocuments.length})</CardTitle>
              <Button onClick={clearDocuments} variant="outline" size="sm">
                Clear All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {generatedDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {documentTemplates[doc.type as keyof typeof documentTemplates]?.name || 'Custom Document'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto bg-gray-50 p-2 rounded">
                      {doc.content}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />
    </>
  );
};

export default DummyDocumentGenerator;