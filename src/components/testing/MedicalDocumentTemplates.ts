/**
 * Medical Document Templates for Test Data Generation
 * 
 * This module provides realistic medical document templates that can be used
 * to generate test data for the medical document analysis system.
 */

export interface MedicalDocumentTemplate {
  id: string;
  name: string;
  description: string;
  docType: 'prescription' | 'lab_result' | 'doctor_note' | 'insurance_form' | 'discharge_summary' | 'therapy_note';
  contentTemplate: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    options?: string[];
    defaultValue?: string | number | boolean;
  }>;
  aiInsightTriggers: string[];
}

export const MEDICAL_DOCUMENT_TEMPLATES: MedicalDocumentTemplate[] = [
  {
    id: 'prescription-bipolar',
    name: 'Bipolar Disorder Prescription',
    description: 'Prescription for bipolar disorder medications',
    docType: 'prescription',
    contentTemplate: `
PRESCRIPTION

Patient: {patientName}
DOB: {dateOfBirth}
Date: {prescriptionDate}

Provider: Dr. {doctorName}, MD
Specialty: Psychiatry
NPI: {npiNumber}

Diagnosis: Bipolar I Disorder (F31.9)

MEDICATIONS:

1. {medication1}
   Dosage: {dosage1}
   Frequency: {frequency1}
   Quantity: {quantity1}
   Refills: {refills1}
   
2. {medication2} 
   Dosage: {dosage2}
   Frequency: {frequency2}
   Quantity: {quantity2}
   Refills: {refills2}

Instructions:
- Take with food to reduce stomach upset
- Monitor mood changes and side effects
- {additionalInstructions}

Next Appointment: {nextAppointment}
Provider Signature: Dr. {doctorName}
    `,
    parameters: [
      { name: 'patientName', type: 'string', defaultValue: 'John Doe' },
      { name: 'dateOfBirth', type: 'date', defaultValue: '1985-03-15' },
      { name: 'prescriptionDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'doctorName', type: 'string', defaultValue: 'Sarah Johnson' },
      { name: 'npiNumber', type: 'string', defaultValue: '1234567890' },
      { name: 'medication1', type: 'select', options: ['Lithium Carbonate', 'Quetiapine', 'Lamotrigine', 'Aripiprazole'], defaultValue: 'Lithium Carbonate' },
      { name: 'dosage1', type: 'select', options: ['300mg', '450mg', '600mg', '900mg'], defaultValue: '600mg' },
      { name: 'frequency1', type: 'select', options: ['Once daily', 'Twice daily', 'Three times daily'], defaultValue: 'Twice daily' },
      { name: 'quantity1', type: 'number', defaultValue: 60 },
      { name: 'refills1', type: 'number', defaultValue: 3 },
      { name: 'medication2', type: 'select', options: ['Quetiapine', 'Olanzapine', 'Risperidone', 'Ziprasidone'], defaultValue: 'Quetiapine' },
      { name: 'dosage2', type: 'select', options: ['25mg', '50mg', '100mg', '200mg'], defaultValue: '100mg' },
      { name: 'frequency2', type: 'select', options: ['Once daily at bedtime', 'Twice daily', 'As needed'], defaultValue: 'Once daily at bedtime' },
      { name: 'quantity2', type: 'number', defaultValue: 30 },
      { name: 'refills2', type: 'number', defaultValue: 2 },
      { name: 'additionalInstructions', type: 'string', defaultValue: 'Schedule regular blood work for lithium levels' },
      { name: 'nextAppointment', type: 'date', defaultValue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    ],
    aiInsightTriggers: [
      'medication_change',
      'dosage_adjustment',
      'bipolar_treatment',
      'mood_stabilizer',
      'psychiatric_medication'
    ]
  },
  
  {
    id: 'lab-result-lithium',
    name: 'Lithium Level Lab Result',
    description: 'Laboratory results for lithium blood levels',
    docType: 'lab_result',
    contentTemplate: `
LABORATORY REPORT

Patient: {patientName}
DOB: {dateOfBirth}
Date Collected: {collectionDate}
Date Reported: {reportDate}

Ordering Physician: Dr. {doctorName}
Lab: {labName}

TEST RESULTS:

Lithium Level: {lithiumLevel} mEq/L
Reference Range: 0.6-1.2 mEq/L
Status: {lithiumStatus}

Comprehensive Metabolic Panel:
- Creatinine: {creatinine} mg/dL (Normal: 0.6-1.2)
- BUN: {bun} mg/dL (Normal: 7-20)
- Thyroid Stimulating Hormone (TSH): {tsh} mIU/L (Normal: 0.4-4.0)

Notes: {labNotes}

Lab Director: Dr. {labDirector}
    `,
    parameters: [
      { name: 'patientName', type: 'string', defaultValue: 'John Doe' },
      { name: 'dateOfBirth', type: 'date', defaultValue: '1985-03-15' },
      { name: 'collectionDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'reportDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'doctorName', type: 'string', defaultValue: 'Sarah Johnson' },
      { name: 'labName', type: 'string', defaultValue: 'Regional Medical Lab' },
      { name: 'lithiumLevel', type: 'select', options: ['0.4', '0.8', '1.0', '1.4', '1.8'], defaultValue: '0.8' },
      { name: 'lithiumStatus', type: 'select', options: ['Normal', 'Low', 'High', 'Critical'], defaultValue: 'Normal' },
      { name: 'creatinine', type: 'select', options: ['0.8', '1.0', '1.2', '1.4'], defaultValue: '1.0' },
      { name: 'bun', type: 'select', options: ['12', '15', '18', '22'], defaultValue: '15' },
      { name: 'tsh', type: 'select', options: ['1.2', '2.5', '3.0', '4.5'], defaultValue: '2.5' },
      { name: 'labNotes', type: 'string', defaultValue: 'Patient on lithium therapy. Recommend monitoring every 3-6 months.' },
      { name: 'labDirector', type: 'string', defaultValue: 'Michael Chen' }
    ],
    aiInsightTriggers: [
      'lab_result',
      'lithium_level',
      'kidney_function',
      'thyroid_function',
      'medication_monitoring'
    ]
  },

  {
    id: 'psychiatry-progress-note',
    name: 'Psychiatry Progress Note',
    description: 'Progress note from psychiatric appointment',
    docType: 'doctor_note',
    contentTemplate: `
PSYCHIATRY PROGRESS NOTE

Patient: {patientName}
DOB: {dateOfBirth}
Date: {visitDate}
Provider: Dr. {doctorName}, MD

CHIEF COMPLAINT: {chiefComplaint}

HISTORY OF PRESENT ILLNESS:
{patientHistory}

MENTAL STATUS EXAM:
Appearance: {appearance}
Behavior: {behavior}
Speech: {speech}
Mood: {mood}
Affect: {affect}
Thought Process: {thoughtProcess}
Thought Content: {thoughtContent}
Perceptual Disturbances: {perceptualDisturbances}
Cognition: {cognition}
Insight: {insight}
Judgment: {judgment}

ASSESSMENT:
Primary Diagnosis: {primaryDiagnosis}
{additionalDiagnoses}

PLAN:
{treatmentPlan}

MEDICATIONS:
{currentMedications}

FOLLOW-UP:
{followUpPlan}

Provider: Dr. {doctorName}
    `,
    parameters: [
      { name: 'patientName', type: 'string', defaultValue: 'John Doe' },
      { name: 'dateOfBirth', type: 'date', defaultValue: '1985-03-15' },
      { name: 'visitDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'doctorName', type: 'string', defaultValue: 'Sarah Johnson' },
      { name: 'chiefComplaint', type: 'string', defaultValue: 'Follow-up for bipolar disorder management' },
      { name: 'patientHistory', type: 'string', defaultValue: 'Patient reports improved mood stability on current medication regimen. Sleep pattern has normalized. Denies manic or depressive episodes in the past month.' },
      { name: 'appearance', type: 'select', options: ['Well-groomed', 'Disheveled', 'Appropriate dress', 'Poor hygiene'], defaultValue: 'Well-groomed' },
      { name: 'behavior', type: 'select', options: ['Cooperative', 'Agitated', 'Withdrawn', 'Hyperactive'], defaultValue: 'Cooperative' },
      { name: 'speech', type: 'select', options: ['Normal rate and rhythm', 'Rapid', 'Slow', 'Pressured'], defaultValue: 'Normal rate and rhythm' },
      { name: 'mood', type: 'select', options: ['Euthymic', 'Depressed', 'Elevated', 'Irritable', 'Anxious'], defaultValue: 'Euthymic' },
      { name: 'affect', type: 'select', options: ['Congruent', 'Flat', 'Labile', 'Restricted'], defaultValue: 'Congruent' },
      { name: 'thoughtProcess', type: 'select', options: ['Linear and goal-directed', 'Tangential', 'Circumstantial', 'Flight of ideas'], defaultValue: 'Linear and goal-directed' },
      { name: 'thoughtContent', type: 'select', options: ['No delusions', 'Grandiose delusions', 'Paranoid delusions', 'Suicidal ideation'], defaultValue: 'No delusions' },
      { name: 'perceptualDisturbances', type: 'select', options: ['None reported', 'Auditory hallucinations', 'Visual hallucinations'], defaultValue: 'None reported' },
      { name: 'cognition', type: 'select', options: ['Intact', 'Impaired concentration', 'Memory deficits'], defaultValue: 'Intact' },
      { name: 'insight', type: 'select', options: ['Good', 'Fair', 'Poor'], defaultValue: 'Good' },
      { name: 'judgment', type: 'select', options: ['Good', 'Fair', 'Poor'], defaultValue: 'Good' },
      { name: 'primaryDiagnosis', type: 'string', defaultValue: 'Bipolar I Disorder, most recent episode mixed, moderate (F31.62)' },
      { name: 'additionalDiagnoses', type: 'string', defaultValue: 'Generalized Anxiety Disorder (F41.1)' },
      { name: 'treatmentPlan', type: 'string', defaultValue: 'Continue current medication regimen. Monitor mood symptoms. Encourage medication adherence and lifestyle modifications.' },
      { name: 'currentMedications', type: 'string', defaultValue: 'Lithium 600mg BID, Quetiapine 100mg QHS' },
      { name: 'followUpPlan', type: 'string', defaultValue: 'Return in 4 weeks. Lab work in 3 months for lithium level.' }
    ],
    aiInsightTriggers: [
      'psychiatric_assessment',
      'mood_symptoms',
      'medication_compliance',
      'treatment_progress',
      'mental_status_exam'
    ]
  },

  {
    id: 'therapy-session-note',
    name: 'Therapy Session Note',
    description: 'Note from therapy/counseling session',
    docType: 'therapy_note',
    contentTemplate: `
THERAPY SESSION NOTE

Patient: {patientName}
Date: {sessionDate}
Session Type: {sessionType}
Duration: {sessionDuration}
Therapist: {therapistName}, {therapistCredentials}

SESSION FOCUS:
{sessionFocus}

PRESENTING CONCERNS:
{presentingConcerns}

INTERVENTIONS USED:
{interventions}

PATIENT RESPONSE:
{patientResponse}

HOMEWORK/BETWEEN-SESSION TASKS:
{homework}

TREATMENT GOALS PROGRESS:
{goalProgress}

RISK ASSESSMENT:
{riskAssessment}

PLAN FOR NEXT SESSION:
{nextSessionPlan}

Therapist: {therapistName}
    `,
    parameters: [
      { name: 'patientName', type: 'string', defaultValue: 'John Doe' },
      { name: 'sessionDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'sessionType', type: 'select', options: ['Individual Therapy', 'Group Therapy', 'Family Therapy', 'Couples Therapy'], defaultValue: 'Individual Therapy' },
      { name: 'sessionDuration', type: 'select', options: ['45 minutes', '50 minutes', '60 minutes', '90 minutes'], defaultValue: '50 minutes' },
      { name: 'therapistName', type: 'string', defaultValue: 'Lisa Williams' },
      { name: 'therapistCredentials', type: 'string', defaultValue: 'LCSW' },
      { name: 'sessionFocus', type: 'string', defaultValue: 'Mood stabilization techniques and coping strategies' },
      { name: 'presentingConcerns', type: 'string', defaultValue: 'Patient reports mild anxiety about upcoming work deadlines. Mood has been stable but experiencing some sleep difficulties.' },
      { name: 'interventions', type: 'string', defaultValue: 'Cognitive Behavioral Therapy (CBT) techniques, mindfulness exercises, sleep hygiene education' },
      { name: 'patientResponse', type: 'string', defaultValue: 'Patient was engaged and receptive to interventions. Demonstrated good understanding of coping strategies.' },
      { name: 'homework', type: 'string', defaultValue: 'Continue daily mood tracking. Practice relaxation techniques before bedtime. Complete thought record worksheet.' },
      { name: 'goalProgress', type: 'string', defaultValue: 'Making steady progress toward mood stability. Improved insight into triggers and warning signs.' },
      { name: 'riskAssessment', type: 'string', defaultValue: 'Low risk for self-harm or harm to others. No current suicidal ideation.' },
      { name: 'nextSessionPlan', type: 'string', defaultValue: 'Continue working on stress management techniques. Review homework assignments.' }
    ],
    aiInsightTriggers: [
      'therapy_session',
      'mental_health_treatment',
      'coping_strategies',
      'mood_tracking',
      'treatment_progress'
    ]
  },

  {
    id: 'discharge-summary',
    name: 'Psychiatric Discharge Summary',
    description: 'Hospital discharge summary for psychiatric admission',
    docType: 'discharge_summary',
    contentTemplate: `
PSYCHIATRIC DISCHARGE SUMMARY

Patient: {patientName}
DOB: {dateOfBirth}
Admission Date: {admissionDate}
Discharge Date: {dischargeDate}
Length of Stay: {lengthOfStay} days

ATTENDING PHYSICIAN: Dr. {attendingPhysician}
ADMITTING DIAGNOSIS: {admittingDiagnosis}
DISCHARGE DIAGNOSIS: {dischargeDiagnosis}

REASON FOR ADMISSION:
{reasonForAdmission}

HOSPITAL COURSE:
{hospitalCourse}

MEDICATIONS AT DISCHARGE:
{dischargeMedications}

CONDITION AT DISCHARGE:
{dischargeCondition}

DISCHARGE INSTRUCTIONS:
{dischargeInstructions}

FOLLOW-UP APPOINTMENTS:
{followUpAppointments}

DISCHARGE DISPOSITION:
{dischargeDisposition}

Attending Physician: Dr. {attendingPhysician}
    `,
    parameters: [
      { name: 'patientName', type: 'string', defaultValue: 'John Doe' },
      { name: 'dateOfBirth', type: 'date', defaultValue: '1985-03-15' },
      { name: 'admissionDate', type: 'date', defaultValue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: 'dischargeDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'lengthOfStay', type: 'number', defaultValue: 5 },
      { name: 'attendingPhysician', type: 'string', defaultValue: 'Robert Martinez' },
      { name: 'admittingDiagnosis', type: 'string', defaultValue: 'Bipolar I Disorder, manic episode, severe' },
      { name: 'dischargeDiagnosis', type: 'string', defaultValue: 'Bipolar I Disorder, manic episode, in partial remission' },
      { name: 'reasonForAdmission', type: 'string', defaultValue: 'Patient presented with acute manic episode characterized by elevated mood, decreased need for sleep, racing thoughts, and poor judgment.' },
      { name: 'hospitalCourse', type: 'string', defaultValue: 'Patient was stabilized on mood stabilizing medications. Showed gradual improvement in manic symptoms. Participated in group therapy and psychoeducation.' },
      { name: 'dischargeMedications', type: 'string', defaultValue: 'Lithium 600mg BID, Quetiapine 200mg QHS, Lorazepam 1mg BID PRN anxiety' },
      { name: 'dischargeCondition', type: 'string', defaultValue: 'Improved and stable. Mood symptoms largely resolved.' },
      { name: 'dischargeInstructions', type: 'string', defaultValue: 'Continue prescribed medications as directed. Attend all follow-up appointments. Avoid alcohol and drugs. Maintain regular sleep schedule.' },
      { name: 'followUpAppointments', type: 'string', defaultValue: 'Outpatient psychiatry in 1 week. Primary care in 2 weeks. Lab work in 1 month.' },
      { name: 'dischargeDisposition', type: 'string', defaultValue: 'Home with family support' }
    ],
    aiInsightTriggers: [
      'psychiatric_hospitalization',
      'acute_episode',
      'medication_initiation',
      'treatment_response',
      'discharge_planning'
    ]
  },

  {
    id: 'insurance-prior-auth',
    name: 'Insurance Prior Authorization',
    description: 'Prior authorization request for psychiatric medication',
    docType: 'insurance_form',
    contentTemplate: `
PRIOR AUTHORIZATION REQUEST

Patient Information:
Name: {patientName}
DOB: {dateOfBirth}
Insurance ID: {insuranceId}
Group Number: {groupNumber}

Provider Information:
Provider: Dr. {providerName}
NPI: {npiNumber}
Phone: {providerPhone}
Fax: {providerFax}

Requested Medication:
Medication: {requestedMedication}
Strength: {medicationStrength}
Quantity: {quantity}
Days Supply: {daysSupply}

Diagnosis:
Primary: {primaryDiagnosis}
ICD-10: {icd10Code}

Clinical Justification:
{clinicalJustification}

Previous Medications Tried:
{previousMedications}

Urgency: {urgency}

Provider Signature: Dr. {providerName}
Date: {requestDate}
    `,
    parameters: [
      { name: 'patientName', type: 'string', defaultValue: 'John Doe' },
      { name: 'dateOfBirth', type: 'date', defaultValue: '1985-03-15' },
      { name: 'insuranceId', type: 'string', defaultValue: 'ABC123456789' },
      { name: 'groupNumber', type: 'string', defaultValue: 'GRP001' },
      { name: 'providerName', type: 'string', defaultValue: 'Sarah Johnson' },
      { name: 'npiNumber', type: 'string', defaultValue: '1234567890' },
      { name: 'providerPhone', type: 'string', defaultValue: '(555) 123-4567' },
      { name: 'providerFax', type: 'string', defaultValue: '(555) 123-4568' },
      { name: 'requestedMedication', type: 'select', options: ['Aripiprazole', 'Olanzapine', 'Quetiapine XR', 'Lurasidone'], defaultValue: 'Aripiprazole' },
      { name: 'medicationStrength', type: 'select', options: ['5mg', '10mg', '15mg', '20mg'], defaultValue: '10mg' },
      { name: 'quantity', type: 'number', defaultValue: 30 },
      { name: 'daysSupply', type: 'number', defaultValue: 30 },
      { name: 'primaryDiagnosis', type: 'string', defaultValue: 'Bipolar I Disorder' },
      { name: 'icd10Code', type: 'string', defaultValue: 'F31.9' },
      { name: 'clinicalJustification', type: 'string', defaultValue: 'Patient has not responded adequately to first-line treatments. This medication is necessary for mood stabilization.' },
      { name: 'previousMedications', type: 'string', defaultValue: 'Lithium (discontinued due to side effects), Quetiapine (partial response)' },
      { name: 'urgency', type: 'select', options: ['Routine', 'Urgent', 'Emergency'], defaultValue: 'Routine' },
      { name: 'requestDate', type: 'date', defaultValue: new Date().toISOString().split('T')[0] }
    ],
    aiInsightTriggers: [
      'insurance_authorization',
      'medication_access',
      'treatment_barriers',
      'medication_change',
      'healthcare_navigation'
    ]
  }
];

export const getTemplateById = (templateId: string): MedicalDocumentTemplate | undefined => {
  return MEDICAL_DOCUMENT_TEMPLATES.find(template => template.id === templateId);
};

export const getTemplatesByType = (docType: MedicalDocumentTemplate['docType']): MedicalDocumentTemplate[] => {
  return MEDICAL_DOCUMENT_TEMPLATES.filter(template => template.docType === docType);
};

export const getAllTemplateNames = (): Array<{ id: string; name: string; description: string }> => {
  return MEDICAL_DOCUMENT_TEMPLATES.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description
  }));
};