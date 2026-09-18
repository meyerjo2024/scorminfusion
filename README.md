# Paramedic Infusion Therapy & Drug Calculations — SCORM 1.2 Package

A comprehensive, standalone SCORM 1.2-conformant e-learning package for paramedic students and emergency care providers, covering intravenous infusion therapy, drug calculations, concentration fundamentals, and patient safety protocols.

## Course Overview

**Target Audience:** Diploma/Bachelor of Health Sciences Paramedic students; Emergency Care Practitioners; Pre-hospital and Critical Care Providers

**Duration:** 120 minutes (module) + 40-minute assessment

**Pass Mark:** 60% (24/40 marks)

### Learning Outcomes

Upon completion, learners will be able to:

1. Classify types of intravenous infusions and identify appropriate clinical indications for each.
2. Convert between drug concentration units (mg/mL, %, ratio strength, units/mL).
3. Calculate drug doses using the fundamental dosage calculation formula.
4. Determine infusion rates in mL/hour for volumetric pumps and gtt/min for gravity drip sets.
5. Apply weight-based dosing formulas for critical care drugs (mcg/kg/min).
6. Calculate paediatric drug doses safely using standardized tools.
7. Identify high-alert medications and implement error-prevention strategies.
8. Demonstrate the Six Rights of Medication Administration and documentation standards.
9. Troubleshoot common infusion pump alarms and respond appropriately.
10. Manage blood transfusions, recognize transfusion reactions, and provide emergency interventions.

## Course Structure

### Module 1: Infusion Therapy & Drug Calculations (120 minutes)

Comprehensive coverage of:

- **5.1 Introduction to Infusion Therapy** — Clinical significance, patient safety imperatives
- **5.2 Types of Intravenous Infusions** — Continuous, intermittent, bolus, TPN, subcutaneous, blood transfusion
- **5.3 Drug Concentration & Dilution Principles** — mg/mL, mcg/mL, % w/v, ratio strength, unit conversions
- **5.4 Infusion Rate Calculations** — mL/hour for pumps, gtt/min for gravity drips, weight-based dosing
- **5.5 Common Infusion Drugs** — Morphine, fentanyl, adrenaline, amiodarone, saline solutions, ketamine, midazolam
- **5.6 Paediatric Infusion Calculations** — Weight-based formulas, Broselow tape integration, safety checks
- **5.7 High-Alert Medications** — ISMP designations, common calculation errors, prevention strategies
- **5.8 Safe Infusion Practices** — Six Rights of Medication Administration, additional safety checks
- **5.9 Infusion Pumps** — Types, programming, troubleshooting alarms
- **5.10 Electrolyte & Glucose Infusions** — KCl, magnesium sulfate, dextrose
- **5.11 Blood Product Transfusion** — Pre-transfusion checks, procedure, reactions, management
- **5.12 Documentation & Medico-Legal Considerations** — Contemporaneous record-keeping, legal defensibility
- **5.13 Literature & Further Reading** — Evidence-based references (ISMP, WHO, SAMF, ECSSA, PALS, ANZCA)
- **5.14 Practical Calculation Exercises** — 5 worked scenarios with detailed solutions

**Features:**
- 4 embedded YouTube videos demonstrating IV calculations and medication administration
- High-resolution reference images (IV anatomy, infusion pumps, drug concentrations)
- Comprehensive worked examples with step-by-step solutions
- Interactive reflection box for learner self-assessment
- Case scenarios grounded in South African paramedic practice

### Final Assessment: 40 Multiple-Choice Questions (1 mark each)

- **Pass Mark:** 24/40 (60%)
- **Content Coverage:** All module topics
- **Question Types:** Calculation problems, concentration conversions, safety protocols, transfusion reactions, medico-legal principles
- **Feedback:** Immediate marking with answer key; learners review incorrect responses
- **SCORM Reporting:** Score and pass/fail status reported to LMS

## Technical Specifications

**SCORM Conformance:** SCORM 1.2 (ADL Run-Time Environment v1.3.1)

**Single Shareable Content Object (SCO):** 
- Launch file: `content/index.html`
- Module content: `content/module1.html`
- Assessment: `content/assessment.html`

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Internet Connection:** Required for embedded YouTube videos; course remains accessible offline if videos do not load

**LMS Compatibility:**
- Blackboard Learn
- Canvas
- Moodle
- Brightspace (D2L)
- Sakai
- Any SCORM 1.2-compliant learning management system

## What's Included

```
scorm-infusion-therapy/
├── imsmanifest.xml                          # SCORM 1.2 manifest
├── README.md                                 # This file
├── content/
│   ├── index.html                           # Course shell & navigation
│   ├── module1.html                         # Main course content (120 min)
│   ├── assessment.html                      # Final assessment (40 questions)
│   └── assets/
│       ├── scorm-api.js                     # SCORM 1.2 API adapter
│       ├── app.js                           # Course navigation controller
│       ├── content-page.js                  # Module page helper (reflection, completion)
│       ├── quiz-data.js                     # 40-question assessment question bank
│       ├── style.css                        # Responsive styling (desktop & tablet)
│       └── images/
│           ├── iv-anatomy.png               # IV anatomy reference (high-res)
│           ├── infusion-pump.png            # Volumetric pump diagram
│           └── drug-concentrations.svg      # Concentration conversion chart
└── videos/                                   # Placeholder for offline video storage
```

## Embedded YouTube Videos

| Section | Video | Duration | Creator |
|---------|-------|----------|---------|
| 5.2 | "IV Drip Flow Rates Drop Factor gtt/min Dosage Calculations Nursing \| NCLEX Review" | 10:24 | RegisteredNurseRN |
| 5.3 | "Dosage Calculations Made Easy \| Reconstitution Calculation Medication Problems" | 9:15 | RegisteredNurseRN |
| 5.4 | "Drug Calculations for Nurses \| IV Infusion Drip Rate Calculations (mL/hr)" | 8:42 | RegisteredNurseRN |
| 5.8 | "IV Medication Administration Nursing \| Intravenous Therapy Nursing Skill" | 7:36 | RegisteredNurseRN |

*Note:* An active internet connection is required for embedded YouTube players to load inside the LMS iframe (standard for externally-hosted video in SCORM packages).

## How It Works

1. **Course Shell** (`index.html`): Provides navigation sidebar, progress bar, and SCORM API wiring. Loads module content in an iframe.

2. **Module Content** (`module1.html`): Comprehensive teaching content with:
   - Embedded YouTube videos
   - High-resolution reference images
   - Interactive calculation examples
   - Reflective practice textarea (autosaves to SCORM suspend_data)
   - "Mark Module Complete & Continue" button

3. **Assessment** (`assessment.html`): 40-question multiple-choice quiz with:
   - Auto-grading (client-side JavaScript)
   - Immediate feedback (correct/incorrect answers highlighted)
   - Score and pass/fail status reported to LMS via SCORM cmi.core.score.raw and cmi.core.lesson_status

4. **SCORM API Integration** (`scorm-api.js`):
   - Detects LMS SCORM API (window.API)
   - Initializes LMS connection on course launch
   - Persists state (module completion, reflections, assessment results) to cmi.suspend_data (JSON)
   - Falls back to standalone/preview mode if no LMS API detected

5. **Navigation & State** (`app.js`):
   - Tracks module completion and reflection text
   - Locks final assessment until module is complete
   - Calculates progress percentage
   - Saves state to SCORM suspend_data on every change and on page unload

## Customization

### Changing the Pass Mark

1. Edit `content/assets/quiz-data.js`:
   - `passMark` (default: 24 for 60% of 40 marks)
   - `totalMarks` (default: 40)

2. Update the hardcoded check in `content/assessment.html` if needed (line ~150: `score >= data.passMark`)

### Adding/Editing Questions

1. Open `content/assets/quiz-data.js`
2. Add or modify entries in the `questions` array:
   ```javascript
   {
     id: 41,
     text: "Your question text here?",
     options: [
       "Option A",
       "Option B",
       "Option C (correct)",
       "Option D"
     ],
     correct: 2  // Index of correct option (0-based)
   }
   ```
3. Update `totalMarks` if question count changes

### Updating Module Content

1. Edit `content/module1.html` directly (HTML)
2. Replace or add YouTube video iframes (update `src` attribute with new video IDs)
3. Add images to `content/assets/images/` and reference via `<img src="assets/images/filename.ext">`

## Packaging for LMS Upload

To create the uploadable `.zip` file:

```bash
cd scorm-infusion-therapy
zip -r ../scorm-infusion-therapy-scorm12.zip . -x ".*"
```

The resulting `.zip` file will have `imsmanifest.xml` at its root (not in a subfolder) — this is required for SCORM 1.2 compliance.

**Upload to LMS:**
- Go to Course Admin → Content Repository / Packages / Learning Modules
- Select "SCORM 1.2" as the package type
- Upload `scorm-infusion-therapy-scorm12.zip`
- LMS will extract and validate the manifest automatically

## South African Healthcare Context

This course aligns with:

- **HPCSA** (Health Professions Council of South Africa) guidelines on professional conduct, record-keeping, and medication safety
- **ECSSA** (Emergency Care Society of South Africa) Clinical Practice Guidelines for Emergency Care
- **SAMF** (South African Medicines Formulary) drug dosing and concentrations
- **South African National Health Act 61 of 2003** — informed consent, confidentiality, duty of care
- **Paramedic scope of practice** — IV access, medication administration, infusion therapy

### South African Medicines & Dosing

Drug concentrations, typical doses, and contraindications reflect South African standard practice and SAMF recommendations. Where applicable, references to South African legislation (e.g. National Health Act, HPCSA ethical rules) are included in learning content.

## Standalone Mode (No LMS)

If opened directly in a browser (e.g., `content/index.html` via file:// or http://localhost/), the course degrades gracefully:

- SCORM API calls output to browser console (no-ops) instead of failing
- Course remains fully usable for preview/authoring
- No score or completion data is persisted (naturally)

## Troubleshooting

### Videos Don't Load
- Check internet connection (YouTube requires active access)
- Verify YouTube is not blocked by firewall/LMS proxy
- Fallback: Download videos manually and embed locally (modify iframe src to local file path)

### Module Doesn't Mark Complete
- Ensure reflection textarea has some text and "Mark Complete" button is clicked
- Check browser console for SCORM API errors (F12 → Console)
- Verify LMS SCORM endpoint is responding (contact LMS admin)

### Assessment Scores Not Reported
- Check that all 40 questions have been answered
- Verify LMS accepts cmi.core.score.raw (some older LMS versions may not)
- Check LMS gradebook for course activity entry

### Suspend_Data Lost on Revisit
- LMS must support SCORM 1.2 suspend_data persistence (standard, but confirm with LMS admin)
- Browser cookies must be enabled
- Session timeout may clear data (check LMS session settings)

## Literature & References

- Institute for Safe Medication Practices (ISMP). *ISMP List of High-Alert Medications in Acute Care Settings* (2024).
- Stassen, W., et al. "Drug calculation competency among South African emergency care providers: a cross-sectional study." *African Journal of Emergency Medicine* 9(2), 2019.
- World Health Organization. *Medication Without Harm: WHO Global Patient Safety Challenge* (2017).
- South African Medicines Formulary (SAMF), 13th edition (2020). South African Medical Association.
- Emergency Care Society of South Africa (ECSSA). *Clinical Practice Guidelines for Emergency Care in South Africa* (2023 update).
- Resuscitation Council UK. *Advanced Life Support*, 8th edition (2021).
- American Heart Association. *Pediatric Advanced Life Support (PALS) Provider Manual* (2020).

## License & Attribution

**Course Content:** Original work created for paramedic education in the South African context.

**Video Attribution:** YouTube videos are embedded from public, freely available educational channels (RegisteredNurseRN). No copyright claimed; educational use only.

**Image Attribution:** Reference images are either public domain, licensed under CC-BY, or original illustrations created for this course.

## Support & Feedback

For issues, feature requests, or feedback on course content:
- **Repository:** [https://github.com/meyerjo2024/scorminfusion](https://github.com/meyerjo2024/scorminfusion)
- **Issues:** Please report bugs or suggestions via GitHub Issues

---

**Version:** 1.0  
**Release Date:** September 2026  
**Created by:** John Meyer  
**SCORM Compliance:** ADL SCORM 1.2 RTE v1.3.1
