# Quick-Start Deployment Guide
## Paramedic Infusion Therapy & Drug Calculations SCORM Package

**Version:** 1.0  
**Last Updated:** September 2026  
**Deployment Time:** 10-15 minutes

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [LMS Upload Methods](#lms-upload-methods)
3. [Testing & Validation](#testing--validation)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Customization Guide](#customization-guide)
6. [Support Resources](#support-resources)

---

## Pre-Deployment Checklist

Before uploading to your LMS, verify the following:

### ✅ **Package Integrity**

```bash
cd ~/scorm-infusion-therapy
ls -la
```

**Required files:**
- `imsmanifest.xml` (SCORM manifest)
- `content/index.html` (course shell)
- `content/module1.html` (main content module)
- `content/module2-interactive.html` (interactive calculators & simulator)
- `content/assessment.html` (40-question assessment)
- `content/assets/` (all JS, CSS, images)

### ✅ **Browser Requirements**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- JavaScript enabled
- Cookies enabled

### ✅ **LMS Requirements**

- SCORM 1.2 support (all major LMS platforms)
- Minimum user role: Learner/Student
- Internet connection (for embedded YouTube videos)

---

## LMS Upload Methods

### **Method 1: Direct ZIP Upload (Recommended)**

#### Step 1: Create the SCORM ZIP Package

```bash
cd ~/scorm-infusion-therapy
zip -r scorm-infusion-therapy-scorm12.zip . -x ".*" -x "__MACOSX/*" -x "*.git/*"
```

**Important:** The ZIP file must have `imsmanifest.xml` at the **root level** (not in a subfolder).

#### Step 2: Verify ZIP Structure

```bash
unzip -l scorm-infusion-therapy-scorm12.zip | head -20
```

**Expected output:**
```
Archive:  scorm-infusion-therapy-scorm12.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     1980  09-18-2026 14:23   imsmanifest.xml
      745  09-18-2026 14:24   content/index.html
    40324  09-18-2026 14:23   content/module1.html
    ...
```

✅ `imsmanifest.xml` should be the **first file** at root level.

#### Step 3: Upload to LMS

**For Moodle:**
1. Go to your course → **Add an activity or resource**
2. Select **SCORM package**
3. Upload `scorm-infusion-therapy-scorm12.zip`
4. Set **Grading method:** Highest grade
5. Set **Display course structure:** Show
6. Save and display

**For Canvas:**
1. Go to **Settings → Apps → View App Configurations**
2. Click **+ App**
3. Select **SCORM** from the list
4. Upload `scorm-infusion-therapy-scorm12.zip`
5. Click **Submit**

**For Blackboard Learn:**
1. Go to **Content → Build Content → Learning Module**
2. Select **SCORM Package**
3. Browse and upload `scorm-infusion-therapy-scorm12.zip`
4. Set availability and due dates
5. Submit

**For Brightspace (D2L):**
1. Go to **Content → Upload → Add SCORM Package**
2. Upload `scorm-infusion-therapy-scorm12.zip`
3. Configure completion tracking (60% pass mark)
4. Publish

---

### **Method 2: GitHub Direct Deploy (Alternative)**

If your LMS supports importing from a Git repository:

```bash
cd ~/scorm-infusion-therapy
git remote add origin https://github.com/meyerjo2024/scorminfusion.git
git push -u origin main
```

Then in your LMS, import directly from the GitHub URL.

---

## Testing & Validation

### **Test 1: Preview Mode (No LMS)**

Open `content/index.html` directly in a browser:

```bash
open ~/scorm-infusion-therapy/content/index.html
```

**Expected behavior:**
- Course loads with navigation sidebar
- Progress bar visible (0% complete)
- Modules and assessment are accessible
- Console shows: `[SCORM] No LMS API adapter found - running in standalone/preview mode`

✅ **Pass:** Course is fully functional in preview mode.

---

### **Test 2: SCORM API Integration (In LMS)**

Launch the course from your LMS and open browser console (F12 → Console).

**Expected console messages:**
```
[SCORM] LMSInitialize called
[SCORM] cmi.core.lesson_status set to: incomplete
```

✅ **Pass:** SCORM API communication is working.

---

### **Test 3: Module Completion**

1. Click **Module 1** (or **Module 2 - Interactive**)
2. Scroll to bottom of module
3. Type some text in the reflection box
4. Click **Mark Module Complete & Continue**

**Expected behavior:**
- Progress bar updates (50% complete for 1 module out of 2)
- Next module/assessment becomes accessible
- Console shows: `[SCORM] cmi.suspend_data updated`

✅ **Pass:** Module completion is tracked correctly.

---

### **Test 4: Interactive Calculator (Module 2)**

1. Navigate to **Module 2 - Interactive Calculators & Simulator**
2. **Volume Calculator:**
   - Dose: `8` mg
   - Concentration: `10` mg/mL
   - Click **Calculate Volume**
   - **Expected result:** `0.80 mL`

3. **Syringe Simulator:**
   - Set rate to `2.0` mL/hour
   - Click **Start Infusion**
   - **Expected behavior:** Plunger moves, delivered volume updates in real-time

✅ **Pass:** Interactive features are working.

---

### **Test 5: Assessment Submission**

1. Complete all modules
2. Navigate to **Final Assessment**
3. Answer all 40 questions
4. Click **Submit Assessment**

**Expected behavior:**
- Score displays immediately (e.g., "Score: 32/40 (80%) — PASS")
- Correct answers highlighted in green, incorrect in red
- Console shows: `[SCORM] cmi.core.score.raw set to: 32`
- LMS gradebook updates with score

✅ **Pass:** Assessment grading and SCORM reporting work correctly.

---

### **Test 6: Suspend/Resume (State Persistence)**

1. Complete Module 1
2. Close the browser (or click "Exit" in LMS)
3. Re-launch the course from LMS

**Expected behavior:**
- Progress bar shows 50% (Module 1 complete)
- Reflection text is restored
- Assessment remains locked until Module 2 complete

✅ **Pass:** State persistence (cmi.suspend_data) is working.

---

## Common Issues & Solutions

### **Issue 1: "imsmanifest.xml not found" Error**

**Cause:** ZIP file has folder structure (e.g., `scorm-infusion-therapy/imsmanifest.xml` instead of root-level `imsmanifest.xml`)

**Solution:**
```bash
cd ~/scorm-infusion-therapy
zip -r ../scorm-infusion-therapy-scorm12-fixed.zip * -x ".*"
```

Ensure you use `*` (contents) not `.` (folder itself).

---

### **Issue 2: Videos Don't Load**

**Cause:** LMS firewall blocks YouTube, or no internet connection.

**Solutions:**

1. **Check firewall settings:** Whitelist `*.youtube.com` and `*.ytimg.com`
2. **Download videos locally:**
   ```bash
   youtube-dl -f best "https://www.youtube.com/watch?v=VIDEO_ID"
   mv VIDEO_ID.mp4 ~/scorm-infusion-therapy/content/assets/videos/
   ```
3. **Update iframe src in module HTML:**
   ```html
   <!-- Before -->
   <iframe src="https://www.youtube.com/embed/jqvdRoWqLQE" ...></iframe>
   
   <!-- After -->
   <iframe src="assets/videos/VIDEO_ID.mp4" ...></iframe>
   ```

---

### **Issue 3: Module Completion Not Tracked**

**Cause:** Reflection textarea is empty, or JavaScript error.

**Solution:**

1. Type at least 1 character in the reflection box
2. Check browser console for JavaScript errors (F12 → Console)
3. Verify `content-page.js` is loaded: `console.log(window.ContentPage)`

---

### **Issue 4: Assessment Score Not Reported to LMS**

**Cause:** LMS doesn't support `cmi.core.score.raw`, or SCORM API connection failed.

**Solution:**

1. Check console for SCORM errors: `[SCORM] LMSSetValue failed`
2. Contact LMS admin to verify SCORM 1.2 compliance
3. Check gradebook settings: Ensure "SCORM activities" are included

---

### **Issue 5: Syringe Simulator Not Rendering**

**Cause:** Canvas not supported, or JavaScript disabled.

**Solution:**

1. Enable JavaScript in browser
2. Try a different browser (Chrome recommended)
3. Check console for errors: `Cannot read property 'getContext' of null`

---

## Customization Guide

### **Change Pass Mark (Default: 60%)**

**File:** `content/assets/quiz-data.js`

```javascript
window.QUIZ_DATA = {
  totalMarks: 40,
  passMark: 24,  // Change to 28 for 70%, or 32 for 80%
  questions: [ ... ]
};
```

---

### **Add/Edit Assessment Questions**

**File:** `content/assets/quiz-data.js`

```javascript
{
  id: 41,  // Next available ID
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

**Remember to update `totalMarks`!**

---

### **Add More Drugs to Syringe Simulator**

**File:** `content/module2-interactive.html` (line ~180)

```html
<select id="simDrug">
  <option value="Morphine|10 mg/mL">Morphine 10 mg/mL</option>
  <option value="Fentanyl|50 mcg/mL">Fentanyl 50 mcg/mL</option>
  <option value="YourDrug|100 mg/mL">Your Drug 100 mg/mL</option>  <!-- Add here -->
</select>
```

---

### **Replace YouTube Videos**

**File:** `content/module1.html` or `content/module2-interactive.html`

Find the `<iframe>` tag and replace the `src` URL:

```html
<!-- Before -->
<iframe src="https://www.youtube.com/embed/jqvdRoWqLQE" ...></iframe>

<!-- After (new video ID) -->
<iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" ...></iframe>
```

---

### **Add Custom CSS Styling**

**File:** `content/assets/style.css`

Add your custom styles at the end:

```css
/* Custom branding */
.app-brand {
  background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
}

.btn {
  background: #YOUR_PRIMARY_COLOR;
}
```

---

### **Enable Module Navigation**

By default, the assessment is locked until modules are complete. To unlock:

**File:** `content/assets/app.js` (line ~48)

```javascript
// Before
var locked = m.key === "assessment" && !moduleComplete();

// After (remove locking)
var locked = false;
```

---

## Support Resources

### **Documentation**

- **Full README:** `~/scorm-infusion-therapy/README.md`
- **SCORM 1.2 Spec:** https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
- **ADL SCORM Documentation:** https://adlnet.gov/projects/scorm/

### **Testing Tools**

- **SCORM Cloud Test:** https://cloud.scorm.com/sc/guest/SignUpForm (Free trial)
- **Rustici SCORM Driver:** https://rusticisoftware.github.io/scormdriver/

### **Community Support**

- **GitHub Issues:** https://github.com/meyerjo2024/scorminfusion/issues
- **SCORM.com Forums:** https://scorm.com/forum/

### **Contact**

- **Repository:** https://github.com/meyerjo2024/scorminfusion
- **Maintainer:** John Meyer

---

## Deployment Checklist

Print this checklist and tick off each step during deployment:

- [ ] ZIP package created correctly (`imsmanifest.xml` at root)
- [ ] Package uploaded to LMS
- [ ] Course published and available to learners
- [ ] Test user account created
- [ ] Preview mode tested (standalone)
- [ ] SCORM API integration verified (console)
- [ ] Module completion tested
- [ ] Interactive calculator tested
- [ ] Syringe simulator tested
- [ ] Assessment submission tested (score reports to LMS)
- [ ] Suspend/resume tested (state persistence)
- [ ] Videos load correctly (or offline fallback configured)
- [ ] Gradebook configured (60% pass mark)
- [ ] Learner notifications configured (optional)
- [ ] Certificate of completion configured (optional)

---

## Troubleshooting Flowchart

```
Course won't launch?
├─ Check ZIP structure (imsmanifest.xml at root)
└─ Check LMS SCORM 1.2 support

Course launches but no SCORM data?
├─ Check browser console for API errors
└─ Verify cookies enabled

Module won't mark complete?
├─ Type text in reflection box
└─ Check JavaScript console for errors

Assessment score not in gradebook?
├─ Verify LMS gradebook settings
└─ Check cmi.core.score.raw in console

Videos don't load?
├─ Check internet connection
├─ Whitelist YouTube in firewall
└─ Download videos locally (see Issue 2)
```

---

## Quick Reference: LMS-Specific Settings

| LMS | Upload Path | Grading Method | Completion Tracking |
|-----|-------------|----------------|---------------------|
| **Moodle** | Add activity → SCORM package | Highest grade | cmi.core.lesson_status |
| **Canvas** | Apps → SCORM | Points possible: 40 | Score updated on submit |
| **Blackboard** | Build Content → SCORM | Points: 40, Pass: 24 | Grade Center auto-update |
| **Brightspace** | Content → SCORM | Grade scheme: 60% | Competency-based tracking |
| **Sakai** | Resources → Upload SCORM | Manual grading | Score viewable in Gradebook |

---

## Performance Optimization

### **For Large Student Populations (>500 users):**

1. **Enable LMS caching** for SCORM packages
2. **Host videos externally** (YouTube, Vimeo) instead of embedding
3. **Use CDN** for static assets (CSS, JS, images)
4. **Monitor suspend_data size** (keep under 4000 characters)

### **For Low-Bandwidth Environments:**

1. **Remove embedded videos** or replace with low-res alternatives
2. **Compress images** (use TinyPNG or similar)
3. **Minify JavaScript and CSS:**
   ```bash
   npm install -g uglify-js clean-css-cli
   uglifyjs content/assets/app.js -o content/assets/app.min.js
   cleancss -o content/assets/style.min.css content/assets/style.css
   ```

---

## Version Control & Updates

To update the course after initial deployment:

```bash
cd ~/scorm-infusion-therapy

# Make your changes (edit HTML, JS, CSS, etc.)

# Commit changes
git add .
git commit -m "Update: Added new practice scenarios"

# Push to GitHub
git push origin main

# Create new SCORM package
zip -r scorm-infusion-therapy-v1.1.zip . -x ".*" -x "*.git/*"

# Upload new version to LMS
# (Most LMS platforms support versioning)
```

---

## Security & Privacy

- **POPIA Compliance (South Africa):** No personally identifiable information (PII) is collected beyond what the LMS tracks (name, email, score).
- **GDPR Compliance (EU):** Course content is anonymized; no tracking cookies used.
- **Data Retention:** Learner progress stored in LMS database; suspend_data cleared after course completion.

---

## Success Metrics

Track these KPIs to measure course effectiveness:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Completion Rate** | >85% | LMS reports → Course completion |
| **Pass Rate** | >75% | LMS gradebook → Students scoring ≥60% |
| **Average Score** | 70-80% | LMS analytics → Mean assessment score |
| **Time-to-Complete** | 150-180 min | SCORM session time data |
| **Retry Rate** | <20% | Students retaking assessment |

---

**Deployment Complete! 🎉**

Your SCORM package is now ready for learners. Monitor the first 10-20 users closely and gather feedback for continuous improvement.

---

**Quick Start Guide Version:** 1.0  
**Last Updated:** September 2026  
**Next Review:** December 2026
