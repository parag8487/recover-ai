
export interface UserProfile {
  id: string;
  name: string;
  color: string;
}

export interface Dosage {
  amount: string | null;
  unit: string | null;
}

export interface ReminderInfo {
  needs_reminder: boolean;
  time: string | null;
  repeat: "none" | "daily" | "weekly" | "custom" | null;
  custom_frequency: string | null;
  notes: string | null;
}

export interface ValidationInfo {
  is_complete: boolean;
  follow_up_question: string | null;
}

export interface QualityAssessment {
  confidence: "high" | "medium" | "low";
  ambiguities: string[];
  confidence_notes: string;
}

export interface AuditEntry {
  timestamp: string;
  action: "created" | "clarified" | "corrected" | "confirmed" | "auto_flagged_missed";
  source: "voice" | "text" | "system";
  details: string;
}

export interface GeminiExtractionResponse {
  type: "medication" | "vitamin" | "treatment" | "observation" | "doctor_visit" | null;
  name: string | null;
  dosage: Dosage;
  route: "oral" | "iv" | "injection" | "topical" | "unknown" | null;
  frequency: string | null;
  time_taken: string | null;
  date: string | null;
  context: "home" | "hospital" | "clinic" | "emergency" | "unknown" | null;
  notes: string | null;
  reminder: ReminderInfo | null;
  validation: ValidationInfo;
  safety_disclaimer: string | null;
  confirmation_message: string;
  switch_profile_to: string | null;
  hospital_mode_command: 'start' | 'stop' | null;
  linked_log_id?: string | null;
}

export interface MedicalLog extends GeminiExtractionResponse {
  id: string;
  profileId: string;
  timestamp: string;
  originalText: string;
  stayId?: string;
  reminder_timestamp?: string;
  quality?: QualityAssessment;
  audit_trail: AuditEntry[];
}

export interface HandoverSummary {
  patient_name: string;
  report_date: string;
  chief_complaints: string[];
  medications_pre_hospital: string[];
  recent_observations: string[];
  clinical_flags: string[];
  narrative_summary: string;
  recent_consultations?: string[];
}

export interface MissedDose {
  medicationName: string;
  expectedTimestamp: string;
  dosage?: Dosage;
}

export interface QueryResultItem {
  date: string;
  name: string;
  dosage: string;
  time: string;
  context: string;
  type: string;
}

export interface QueryResponse {
  query: string;
  results: QueryResultItem[];
  safety_disclaimer: string | null;
}
