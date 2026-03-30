# RecoverAI-Lite | Voice-First Clinical Companion
> **Bridging the Clinical Data Gap with Intelligent Voice Logging**

RecoverAI-Lite is a streamlined, focused version of the RecoverAI ecosystem, designed specifically to empower patients and caregivers with a voice-first **Clinical Companion**. It converts natural speech into structured clinical records, ensuring that no detail of the recovery journey is lost between doctor visits.

---

## 🚀 Key Features

### 1. Clinical Companion (Caregiver OS)
- **Gemini-Powered Logging**: Native Google Gemini integration that converts natural voice commands into structured medication and symptom logs.
- **Hospital Mode**: A specialized interface for high-intensity monitoring during the first 72 hours post-discharge.
- **Persistent Clinical Memory**: Secure local storage of all clinical interactions, providing a comprehensive history for medical consultations.
- **Patient-Centric Design**: A minimal, high-contrast UI designed for ease of use in recovery environments.

---

## 🏗️ Architecture
- **Voice Pipeline**: Uses the Google Generative AI SDK for real-time natural language processing.
- **Lite Backend**: A fast Node.js API focused on secure authentication and serving the companion modules.
- **Persistence**: Hybrid storage using secure local memory for speed and clinical reliability.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Framer Motion, Tailwind CSS.
- **Backend**: Node.js, Express.
- **Intelligence**: Google Gemini 1.5 Flash / Pro.
- **State Management**: Zustand.

---

## 🛠️ Getting Started

### Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/parag8487/recover-ai.git
   cd recover-ai
   ```

2. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *Runs on Port 5005*

3. **Start the Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *Accessible at http://localhost:5173*

---

## 🌍 Future Scope
- **IoT Integration**: Direct API sync with consumer health wearables.
- **FHIR Export**: One-click generation of EMR-compatible clinical summaries.
- **Geriatric Accessibility**: Audio-only interaction modes for vision-impaired users.
