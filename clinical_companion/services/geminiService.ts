
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeminiExtractionResponse, QueryResponse, MedicalLog, QualityAssessment, AuditEntry, HandoverSummary } from "../types";

const SAFETY_DISCLAIMER_TEXT = "I can help you record and track information, but I can’t give medical advice. Please consult a healthcare professional.";

/**
 * Common system instruction for logging (Text or Voice)
 */
const getLoggingSystemInstruction = (isHospitalModeActive: boolean, recentLogContext: any) => `
    You are a professional medical reconciliation assistant. 
    Your primary goal is to synchronize in-house medication logs, doctor visit notes, and hospital treatments into a unified medical history.

    CORE RESPONSIBILITIES:
    1. SYNCHRONIZATION: Detect if a user is following up on a doctor visit (e.g., "The doctor at the clinic said... so I'm taking this"). 
    2. RECONCILIATION: If a user logs a med that was previously recorded, update the context (home vs hospital).
    3. LINKING: Use 'linked_log_id' if a new log is a reaction or follow-up to the 'Recent Log Context'.

    TYPES:
    - medication: Prescribed medications.
    - vitamin: Supplements.
    - treatment: Hospital procedures, IVs, PT.
    - doctor_visit: Professional consultations or clinical findings.
    - observation: Symptoms, caregiver notes, reactions.

    HOSPITAL MODE: ${isHospitalModeActive ? 'ACTIVE (All logs will be tagged as hospital context unless specified otherwise)' : 'INACTIVE'}.
    RECENT CONTEXT: ${recentLogContext ? JSON.stringify(recentLogContext) : 'None'}.

    Return JSON only.
`;

/**
 * Generates a clinical handover summary for medical staff.
 */
export const generateClinicalHandover = async (
  patientName: string,
  logs: MedicalLog[]
): Promise<HandoverSummary> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });

  const systemInstruction = `
    You are a senior clinical documentation specialist. 
    Synthesize raw caregiver logs (home, hospital, doctor visits) into a "Clinical Handover".
    Highlight the synchronization between home medication and hospital treatments.
    Identify any inconsistencies in dosing between home and facility if apparent.
    
    CATEGORIZATION:
    1. Chief Complaints (Symptoms).
    2. Pre-Hospital Meds (Home context).
    3. Recent Consultations (doctor_visit logs).
    4. Recent Observations (caregiver notes).
    5. Clinical Flags (Anomalies, reactions, or missed doses).
    
    Return JSON only.
  `;

  const logDataString = JSON.stringify(logs.slice(0, 50));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ text: `Patient: ${patientName}\nLogs:\n${logDataString}` }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patient_name: { type: Type.STRING },
          report_date: { type: Type.STRING },
          chief_complaints: { type: Type.ARRAY, items: { type: Type.STRING } },
          medications_pre_hospital: { type: Type.ARRAY, items: { type: Type.STRING } },
          recent_consultations: { type: Type.ARRAY, items: { type: Type.STRING } },
          recent_observations: { type: Type.ARRAY, items: { type: Type.STRING } },
          clinical_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
          narrative_summary: { type: Type.STRING }
        },
        required: ["patient_name", "report_date", "chief_complaints", "medications_pre_hospital", "recent_observations", "clinical_flags", "narrative_summary"]
      }
    }
  });

  if (!response.text) throw new Error("Handover generation failed.");
  return JSON.parse(response.text.trim());
};

/**
 * Process text input for logging.
 */
export const processTextLog = async (
  text: string,
  isHospitalModeActive: boolean = false,
  recentLogContext?: { id: string, name: string, type: string } | null
): Promise<GeminiExtractionResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ text: `Input text: """${text}"""` }],
    config: {
      systemInstruction: getLoggingSystemInstruction(isHospitalModeActive, recentLogContext),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["medication", "vitamin", "treatment", "observation", "doctor_visit"], nullable: true },
          name: { type: Type.STRING, nullable: true },
          dosage: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.STRING, nullable: true },
              unit: { type: Type.STRING, nullable: true }
            },
            nullable: true
          },
          route: { type: Type.STRING, nullable: true },
          frequency: { type: Type.STRING, nullable: true },
          time_taken: { type: Type.STRING, nullable: true },
          date: { type: Type.STRING, nullable: true },
          context: { type: Type.STRING, enum: ["home", "hospital", "clinic", "emergency"], nullable: true },
          notes: { type: Type.STRING, nullable: true },
          reminder: {
            type: Type.OBJECT,
            properties: {
              needs_reminder: { type: Type.BOOLEAN },
              time: { type: Type.STRING, nullable: true }
            },
            nullable: true
          },
          validation: {
            type: Type.OBJECT,
            properties: {
              is_complete: { type: Type.BOOLEAN },
              follow_up_question: { type: Type.STRING, nullable: true }
            },
            required: ["is_complete"]
          },
          confirmation_message: { type: Type.STRING },
          switch_profile_to: { type: Type.STRING, nullable: true },
          hospital_mode_command: { type: Type.STRING, enum: ["start", "stop"], nullable: true },
          linked_log_id: { type: Type.STRING, nullable: true }
        },
        required: ["validation", "confirmation_message"]
      }
    }
  });

  if (!response.text) throw new Error("Empty response from assistant.");
  return JSON.parse(response.text.trim());
};

/**
 * Main service to process voice logs.
 */
export const processVoiceCommand = async (
  audioBase64: string,
  transcript: string,
  isHospitalModeActive: boolean = false,
  recentLogContext?: { id: string, name: string, type: string } | null
): Promise<GeminiExtractionResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { text: `Spoken input:\n"""\n${transcript}\n"""` },
          { inlineData: { mimeType: 'audio/webm', data: audioBase64 } },
        ]
      }
    ],
    config: {
      systemInstruction: getLoggingSystemInstruction(isHospitalModeActive, recentLogContext),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["medication", "vitamin", "treatment", "observation", "doctor_visit"], nullable: true },
          name: { type: Type.STRING, nullable: true },
          dosage: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.STRING, nullable: true },
              unit: { type: Type.STRING, nullable: true }
            },
            nullable: true
          },
          route: { type: Type.STRING, nullable: true },
          frequency: { type: Type.STRING, nullable: true },
          time_taken: { type: Type.STRING, nullable: true },
          date: { type: Type.STRING, nullable: true },
          context: { type: Type.STRING, enum: ["home", "hospital", "clinic", "emergency"], nullable: true },
          notes: { type: Type.STRING, nullable: true },
          reminder: {
            type: Type.OBJECT,
            properties: {
              needs_reminder: { type: Type.BOOLEAN },
              time: { type: Type.STRING, nullable: true }
            },
            nullable: true
          },
          validation: {
            type: Type.OBJECT,
            properties: {
              is_complete: { type: Type.BOOLEAN },
              follow_up_question: { type: Type.STRING, nullable: true }
            },
            required: ["is_complete"]
          },
          confirmation_message: { type: Type.STRING },
          switch_profile_to: { type: Type.STRING, nullable: true },
          hospital_mode_command: { type: Type.STRING, enum: ["start", "stop"], nullable: true },
          linked_log_id: { type: Type.STRING, nullable: true }
        },
        required: ["validation", "confirmation_message"]
      }
    }
  });

  if (!response.text) throw new Error("Empty response from assistant.");
  return JSON.parse(response.text.trim());
};

/**
 * Assesses the quality of an extraction.
 */
export const assessLogQuality = async (
  log: GeminiExtractionResponse
): Promise<QualityAssessment> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });

  const systemInstruction = `
    Assess the quality of a medical log record. 
    Return JSON only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ text: `Input record:\n${JSON.stringify(log)}` }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
          ambiguities: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence_notes: { type: Type.STRING }
        },
        required: ["confidence", "ambiguities", "confidence_notes"]
      }
    }
  });

  if (!response.text) throw new Error("Quality assessment failed.");
  return JSON.parse(response.text.trim());
};

/**
 * Generates an audit trail entry.
 */
export const generateAuditEntry = async (
  currentRecord: GeminiExtractionResponse,
  userInput: string,
  previousRecord: MedicalLog | null = null,
  source: "voice" | "text" | "system" = "voice"
): Promise<AuditEntry> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });

  const systemInstruction = `
    Generate a factual audit entry for a clinical record action.
    Return JSON only.
  `;

  const contextPrompt = `
    Context:
    - Previous record: ${previousRecord ? JSON.stringify(previousRecord) : 'null'}
    - New record: ${JSON.stringify(currentRecord)}
    - User input: """${userInput}"""
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ text: contextPrompt }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING },
          action: { type: Type.STRING, enum: ["created", "clarified", "corrected", "confirmed", "auto_flagged_missed"] },
          source: { type: Type.STRING, enum: ["voice", "text", "system"] },
          details: { type: Type.STRING }
        },
        required: ["timestamp", "action", "source", "details"]
      }
    }
  });

  if (!response.text) throw new Error("Audit entry generation failed.");
  return JSON.parse(response.text.trim());
};

/**
 * TTS Synthesis using Gemini 2.5 TTS
 */
export const synthesizeSpeech = async (text: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Speech synthesis failed.");
  return base64Audio;
};

export const decodeBase64Audio = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

/**
 * Query service to answer user history questions.
 */
export const queryMedicalLogs = async (
  query: string,
  logs: MedicalLog[]
): Promise<QueryResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("CRITICAL: Gemini API Key is missing or invalid in environment.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_HERE" });

  const systemInstruction = `
    Answer medical history questions by reconciling logs from home, doctor visits, and hospital stays.
    Explain relationships between events if possible (e.g., "The treatment was started after the doctor visit").
    Return JSON only.
  `;

  const logDataString = JSON.stringify(logs.map(l => ({
    name: l.name,
    type: l.type,
    dosage: `${l.dosage?.amount || ''} ${l.dosage?.unit || ''}`,
    time: l.time_taken || l.frequency,
    date: l.date,
    context: l.context,
    timestamp: l.timestamp,
    notes: l.notes
  })));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { text: `User History Logs:\n${logDataString}` },
          { text: `User Query: "${query}"` }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                time: { type: Type.STRING },
                context: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["date", "name", "dosage", "time", "context", "type"]
            }
          },
          safety_disclaimer: { type: Type.STRING, nullable: true }
        },
        required: ["query", "results"]
      }
    }
  });

  if (!response.text) throw new Error("Empty response from assistant.");
  return JSON.parse(response.text.trim());
};
