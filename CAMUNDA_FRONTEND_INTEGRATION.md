# Camunda Frontend Integration - Complete

## ✅ What's Been Integrated

The frontend is now **fully integrated** with Camunda workflows! Here's what happens automatically:

---

## 🔄 Workflow Triggers

### **1. Student Upload → Starts Hiring Process**

**File:** `StudentUpload.jsx`

When a college user uploads a new student/candidate:
```javascript
// After candidate is created
await api.startHiringProcess(
  candidateId,
  candidateName,
  candidateEmail
);
```

**What happens:**
- Camunda hiring process starts automatically
- Candidate enters "Resume Screening" stage
- HR receives task in Camunda Tasklist
- Process tracks candidate through all rounds

---

### **2. Hiring Round Completion → Advances Workflow**

**File:** `HiringRounds.jsx`

When HR completes a hiring round (Resume Screening, Technical, HR, Panel):
```javascript
// Get current Camunda task
const task = await api.getCurrentTaskForCandidate(candidateId);

// Complete the task with feedback
await api.completeHiringRound(
  task.taskId,
  status,      // CLEARED or REJECTED
  feedback,
  score
);
```

**What happens:**
- Camunda automatically moves to next round if CLEARED
- If REJECTED, process ends with appropriate status
- Email notifications sent automatically
- All transitions tracked in Camunda history

---

### **3. Document Upload → Starts Verification Workflow**

**File:** `InternDocuments.jsx`

When intern uploads a document:
```javascript
// After document is uploaded
await api.startDocumentVerification(
  documentId,
  internId
);
```

**What happens:**
- Document enters auto-validation
- If format/size valid → Goes to HR review queue
- If invalid → Intern notified to reupload
- Camunda tracks entire verification process

---

### **4. Document Review → Completes Verification**

**File:** `Documents.jsx`

When HR verifies or rejects a document:
```javascript
// Get Camunda task for document
const task = await api.getDocumentTask(documentId);

// Complete verification
await api.reviewDocument(
  task.taskId,
  'VERIFIED',  // or 'REJECTED'
  remarks
);
```

**What happens:**
- Document status updated
- Intern notified via email
- If all documents verified → Triggers offer generation
- Workflow automatically checks completion status

---

### **5. Offer Acceptance → Triggers Onboarding**

**File:** `InternOffer.jsx`

When intern accepts offer:
```javascript
await api.acceptOffer(candidateId);
```

When intern declines offer:
```javascript
await api.declineOffer(candidateId, reason);
```

**What happens:**
- Offer status updated in Camunda
- If accepted → Onboarding process starts automatically
- If declined → Process ends with decline status
- HR notified of decision

---

## 🔧 How It Works

### **Hybrid Approach**

The integration uses a **hybrid approach** - both traditional APIs and Camunda workflows run in parallel:

1. **Traditional API** - Updates database directly (backward compatible)
2. **Camunda Workflow** - Manages process orchestration and automation

**Benefits:**
- ✅ Existing functionality still works
- ✅ Camunda adds automation layer
- ✅ No breaking changes
- ✅ Graceful degradation if workflow fails

### **Error Handling**

All Camunda integrations have try-catch blocks:
```javascript
try {
  await api.completeHiringRound(...);
  console.log('Workflow completed');
} catch (workflowErr) {
  console.error('Workflow failed:', workflowErr);
  // Main operation still succeeds
}
```

This ensures:
- Main operations never fail due to workflow issues
- Workflows are optional enhancement, not requirement
- Logs help debug workflow problems

---

## 📊 Monitoring Workflows

### **Check Process Status**

You can check workflow status from frontend:

```javascript
// Get candidate's current workflow task
const task = await api.getCurrentTaskForCandidate(candidateId);
console.log('Current round:', task.taskName);

// Get all process variables
const status = await api.getProcessStatusForCandidate(candidateId);
console.log('Status:', status);

// Get document workflow status
const docStatus = await api.getDocumentProcessStatus(documentId);
console.log('Document status:', docStatus);
```

### **View in Camunda UI**

HR/Admin can monitor workflows in Camunda:
- **Cockpit:** `http://localhost:8080/api/camunda/app/cockpit`
- **Tasklist:** `http://localhost:8080/api/camunda/app/tasklist`

---

## 🎯 What Gets Automated

### **Email Notifications**
- ✅ Offer letter generated
- ✅ Document verified/rejected
- ✅ Onboarding initiated
- ✅ All sent automatically by Camunda

### **Status Transitions**
- ✅ Candidate moves through rounds
- ✅ Documents progress through verification
- ✅ Offer acceptance triggers onboarding
- ✅ All managed by workflow engine

### **Business Rules**
- ✅ Can't skip rounds (enforced by BPMN)
- ✅ All documents must be verified before offer
- ✅ Auto-reject documents with invalid format
- ✅ Rules defined visually in BPMN

---

## 🧪 Testing the Integration

### **1. Test Hiring Workflow**

1. Go to Student Upload page (as College user)
2. Add a new student
3. Check browser console - should see:
   ```
   Hiring workflow started for candidate: 123
   ```
4. Go to HiringRounds page (as HR)
5. Complete a round - console shows:
   ```
   Found Camunda task: task-abc123
   Camunda task completed successfully
   ```

### **2. Test Document Workflow**

1. Login as Intern
2. Upload a document
3. Console shows:
   ```
   Document verification workflow started for doc: 456
   ```
4. Login as HR
5. Verify/reject document - console shows:
   ```
   Found Camunda task for document: task-def456
   Camunda document workflow completed
   ```

### **3. Test Offer Workflow**

1. Complete all hiring rounds for a candidate
2. Camunda auto-generates offer letter
3. Intern sees offer in InternOffer page
4. Click "Accept Offer"
5. Console shows:
   ```
   Camunda offer acceptance workflow completed
   ```

---

## 🔍 Debugging

### **Check if Workflow Started**

Open browser DevTools → Console tab. Look for:
- `Hiring workflow started for candidate: X`
- `Document verification workflow started`
- `Camunda task completed successfully`

### **Check if Task Found**

If you see:
```
No Camunda task found, using traditional flow
```

This means:
- Workflow wasn't started for this entity
- Or workflow already completed
- Traditional API still works fine

### **Check Backend Logs**

```bash
# In backend terminal
# Look for:
=== Starting Hiring Process ===
Hiring process started with instance ID: abc123
=== Offer Letter Generation Process ===
```

---

## 📝 API Endpoints Used

### **Hiring Workflow**
- `POST /workflow/hiring/start` - Start hiring process
- `POST /workflow/hiring/complete-round` - Complete hiring round
- `GET /workflow/hiring/candidate/{id}/current-task` - Get current task
- `POST /workflow/hiring/offer/accept` - Accept offer
- `POST /workflow/hiring/offer/decline` - Decline offer

### **Document Workflow**
- `POST /workflow/documents/start` - Start document verification
- `POST /workflow/documents/review` - Review document
- `GET /workflow/documents/document/{id}/task` - Get document task

---

## 🎉 Benefits You Get

1. **Automated Emails** - No manual notification sending
2. **Process Tracking** - See every step in Camunda
3. **Audit Trail** - Complete history preserved
4. **Business Rules** - Enforced automatically
5. **Visual Workflows** - Non-developers can understand process
6. **Scalability** - Handle thousands of candidates
7. **Reliability** - Workflow engine manages state

---

## 🚀 Next Steps

1. **Rebuild frontend:**
   ```bash
   npm install
   npm run dev
   ```

2. **Rebuild backend:**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

3. **Test the integration:**
   - Upload a student
   - Complete hiring rounds
   - Upload documents
   - Accept offers
   
4. **Monitor in Camunda:**
   - Open Cockpit to see running processes
   - Open Tasklist to see pending tasks

---

**The integration is complete and ready to use! 🎊**
