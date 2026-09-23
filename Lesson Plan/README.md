# Official REB Lesson Plan Generation System

A complete, standalone, production-ready **Competency-Based Curriculum (CBC) Lesson Plan Generation System** engineered to comply with Rwanda Education Board (REB) national guidelines.

---

## 🌟 Key Features

1. **REB CBC Standard Alignment**:
   - Generates complete A4 REB Lesson Plan structures including metadata headers, special needs accommodations, unit titles, key unit competences, instructional objectives, location, learning materials, and official references.
   - 3-Stage Process Table: **Introduction**, **Lesson Development**, and **Conclusion** breaking down teacher activities, learner activities, generic competences, and cross-cutting issues.

2. **Sequential Multi-Lesson Bulk Date Assignment**:
   - Supports batch generation of multiple lesson plans for a unit (e.g., Lesson 1, Lesson 2, Lesson 3).
   - Automatically computes sequential weekday dates (skipping Saturdays and Sundays) for each consecutive lesson.
   - Outputs lesson numbers in the official REB format (e.g. `1 Out of 3`, `2 Out of 3`, `3 Out of 3`).

3. **High-Speed Vector PDF & ZIP Export**:
   - Generates crisp, official A4 vector PDF documents using `jsPDF`.
   - Features dynamic height calculations (`calcHeight`) and automatic vertical pagination page-breaks so long descriptions never clip.
   - Includes bulk ZIP export (`JSZip` + `file-saver`) to package an entire unit's lesson plans into a single downloadable archive.

4. **Guaranteed Local Fallback Engine**:
   - Includes a rich pedagogical fallback generator (`generateRichPedagogicalSteps`) containing hundreds of words per step.
   - Ensures full operational reliability even when offline or when external AI services are unavailable.

---

## 📦 Required Dependencies

If importing into a React project, install the following packages:

```bash
npm install jspdf html2canvas jszip file-saver lucide-react
npm install --save-dev @types/file-saver
```

---

## 🚀 How to Use in Another System

Simply copy `LessonPlanGenerator.tsx` into your project's component directory and import it:

```tsx
import React from 'react';
import { LessonPlanGenerator } from './LessonPlan/LessonPlanGenerator';

export function App() {
  return (
    <div>
      <LessonPlanGenerator />
    </div>
  );
}
```

---

## 🛠 Backend AI Proxy (Optional Express Route)

If you wish to attach a Gemini AI backend endpoint (`/api/gemini/lesson-plan`), create the following route:

```ts
app.post('/api/gemini/lesson-plan', async (req, res) => {
  const payload = req.body;
  // Invoke Google Gemini API with REB system prompt
  // Return JSON: { success: true, lessonPlans: [...] }
});
```

---

## 📄 License
MIT License - Free to maintain, scale, or integrate into any educational management platform.
