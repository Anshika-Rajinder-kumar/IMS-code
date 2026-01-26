# Camunda BPM Integration - Wissen IMS

## 🎯 Overview

This project now includes **Camunda BPM Platform 7** for automated workflow management. Camunda handles the hiring process and document verification workflows, providing visual process modeling, task management, and audit trails.

---

## 🚀 What's Been Implemented

### 1. **Hiring Process Workflow** (`hiring-process.bpmn`)
Automates the entire candidate hiring journey:

```
Candidate Applied
    ↓
Resume Screening (HR Task)
    ↓ [Cleared/Rejected]
Technical Round (HR Task)
    ↓ [Cleared/Rejected]
HR Round (HR Task)
    ↓ [Cleared/Rejected]
Panel Interview (HR Task)
    ↓ [Cleared/Rejected]
Generate Offer Letter (Automated)
    ↓
Send Notification (Automated)
    ↓
Candidate Reviews Offer
    ↓ [Accepted/Declined]
Initiate Onboarding (Automated)
    ↓
Candidate Hired ✓
```

### 2. **Document Verification Workflow** (`document-verification.bpmn`)
Automates document review and approval:

```
Document Uploaded
    ↓
Auto-Validation (Check format, size)
    ↓ [Valid/Invalid]
HR Manual Review
    ↓ [Verified/Rejected]
Update Status + Notify Intern
    ↓
Check All Documents
    ↓ [All Verified/More Needed]
Trigger Offer Generation
    ↓
Complete ✓
```

---

## 📦 Components Added

### **Dependencies** (`pom.xml`)
```xml
- camunda-bpm-spring-boot-starter-webapp (7.20.0)
- camunda-bpm-spring-boot-starter-rest (7.20.0)
- camunda-spin-dataformat-all
- camunda-engine-plugin-spin
```

### **Configuration** (`application.properties`)
```properties
camunda.bpm.admin-user.id=admin
camunda.bpm.admin-user.password=admin
camunda.bpm.auto-deployment-enabled=true
camunda.bpm.history-level=full
```

### **Delegate Services** (`com.wissen.ims.camunda.delegate`)
- `OfferGenerationDelegate` - Auto-generates offer letters
- `NotificationDelegate` - Sends email notifications
- `OnboardingDelegate` - Initiates onboarding process
- `DocumentValidationDelegate` - Auto-validates document format/size
- `DocumentStatusDelegate` - Updates document status
- `AllDocumentsCheckDelegate` - Checks if all docs verified
- `OfferTriggerDelegate` - Triggers offer generation

### **Process Services**
- `HiringProcessService` - Manages hiring workflows
- `DocumentProcessService` - Manages document verification

### **REST Controllers**
- `HiringWorkflowController` - APIs for hiring process
- `DocumentWorkflowController` - APIs for document verification

---

## 🔧 How to Use

### **1. Access Camunda Web Applications**

After starting the backend, access:

| Application | URL | Login |
|------------|-----|-------|
| **Camunda Cockpit** | `http://localhost:8080/api/camunda/app/cockpit` | admin/admin |
| **Camunda Tasklist** | `http://localhost:8080/api/camunda/app/tasklist` | admin/admin |
| **Camunda Admin** | `http://localhost:8080/api/camunda/app/admin` | admin/admin |

### **2. Start Hiring Process**

**API Endpoint:**
```http
POST /api/workflow/hiring/start
Content-Type: application/json

{
  "candidateId": 1,
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com"
}
```

**Response:**
```json
{
  "processInstanceId": "abc123-def456",
  "message": "Hiring process started successfully"
}
```

### **3. Complete Hiring Round**

**API Endpoint:**
```http
POST /api/workflow/hiring/complete-round
Content-Type: application/json

{
  "taskId": "task123",
  "status": "CLEARED",
  "feedback": "Excellent technical skills",
  "score": 85
}
```

### **4. Get Pending Tasks**

**API Endpoint:**
```http
GET /api/workflow/hiring/pending-tasks
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "taskId": "task123",
    "taskName": "Resume Screening",
    "taskDefinitionKey": "Task_ResumeScreening",
    "processInstanceId": "abc123",
    "createdDate": "2026-01-26T10:30:00"
  }
]
```

### **5. Start Document Verification**

**API Endpoint:**
```http
POST /api/workflow/documents/start
Content-Type: application/json

{
  "documentId": 5,
  "internId": 10
}
```

### **6. Review Document (HR)**

**API Endpoint:**
```http
POST /api/workflow/documents/review
Content-Type: application/json

{
  "taskId": "doc-task123",
  "status": "VERIFIED",
  "remarks": "All documents are in order"
}
```

### **7. Accept/Decline Offer**

**Accept Offer:**
```http
POST /api/workflow/hiring/offer/accept
Content-Type: application/json

{
  "candidateId": 1
}
```

**Decline Offer:**
```http
POST /api/workflow/hiring/offer/decline
Content-Type: application/json

{
  "candidateId": 1,
  "reason": "Accepted another offer"
}
```

---

## 🎨 Visualize Processes

### **Using Camunda Modeler (Recommended)**

1. **Download:** [Camunda Modeler](https://camunda.com/download/modeler/)
2. **Open BPMN files:**
   - `backend/src/main/resources/processes/hiring-process.bpmn`
   - `backend/src/main/resources/processes/document-verification.bpmn`
3. **Edit and redeploy** - Changes auto-deploy on app restart

### **In Camunda Cockpit**

1. Go to `http://localhost:8080/api/camunda/app/cockpit`
2. Click "Processes" → View running instances
3. Click on any instance to see:
   - Current state
   - Process variables
   - Completed tasks
   - Incident reports (if any)

---

## 🔄 How It Works

### **Workflow Engine Benefits:**

1. **Automated State Management** - No manual status updates
2. **Visual Process Modeling** - See entire workflow at a glance
3. **Audit Trail** - Complete history of every step
4. **Task Management** - Automatic task assignment
5. **Error Handling** - Built-in retry and compensation
6. **Parallel Execution** - Handle multiple candidates simultaneously

### **Integration with Existing Code:**

Your existing controllers and services still work! Camunda adds:
- **Process orchestration** layer on top
- **Automated transitions** between states
- **Email notifications** at key stages
- **Business rules** enforcement (auto-reject if conditions not met)

---

## 📊 Monitoring & Analytics

### **View Process Metrics:**

1. **Active Instances** - How many processes running
2. **Completed Instances** - Success/failure rates
3. **Average Duration** - Time spent in each stage
4. **Bottlenecks** - Identify slow stages
5. **Task Assignment** - Workload distribution

### **Query Process Data:**

```java
// Example: Get all candidates in Technical Round
List<ProcessInstance> instances = runtimeService
    .createProcessInstanceQuery()
    .variableValueEquals("currentRound", "TECHNICAL_ROUND")
    .list();
```

---

## 🛠️ Customization

### **Modify Workflows:**

1. Open BPMN file in Camunda Modeler
2. Add/remove tasks, gateways, or service tasks
3. Save and restart application
4. Changes auto-deploy

### **Add New Delegate:**

```java
@Component("myCustomDelegate")
public class MyCustomDelegate implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        // Your custom logic
    }
}
```

Then reference in BPMN:
```xml
<serviceTask id="Task_Custom" 
             camunda:delegateExpression="${myCustomDelegate}"/>
```

---

## 🧪 Testing

### **Test Workflow Manually:**

1. Start process via API
2. Go to Camunda Tasklist
3. Claim and complete tasks
4. Monitor progress in Cockpit

### **Unit Test Workflows:**

```java
@SpringBootTest
class HiringProcessTest {
    
    @Autowired
    private RuntimeService runtimeService;
    
    @Test
    void testHiringProcessFlow() {
        ProcessInstance instance = runtimeService
            .startProcessInstanceByKey("hiring-process");
        
        assertNotNull(instance);
        // Add more assertions
    }
}
```

---

## 📝 API Summary

| Endpoint | Method | Description | Role |
|----------|--------|-------------|------|
| `/workflow/hiring/start` | POST | Start hiring process | HR/ADMIN |
| `/workflow/hiring/complete-round` | POST | Complete hiring round | HR/ADMIN |
| `/workflow/hiring/pending-tasks` | GET | Get pending HR tasks | HR/ADMIN |
| `/workflow/hiring/candidate/{id}/current-task` | GET | Get candidate's current task | HR/ADMIN |
| `/workflow/hiring/offer/accept` | POST | Accept offer letter | INTERN |
| `/workflow/hiring/offer/decline` | POST | Decline offer letter | INTERN |
| `/workflow/documents/start` | POST | Start doc verification | INTERN |
| `/workflow/documents/review` | POST | Review document | HR/ADMIN |
| `/workflow/documents/pending-reviews` | GET | Get pending doc reviews | HR/ADMIN |

---

## 🎓 Learn More

- **Camunda Docs:** https://docs.camunda.org/
- **BPMN 2.0 Tutorial:** https://camunda.com/bpmn/
- **Best Practices:** https://camunda.com/best-practices/

---

## 🚨 Important Notes

1. **Database:** Camunda creates its own tables in PostgreSQL (prefixed with `ACT_`)
2. **Performance:** Camunda is lightweight and handles thousands of process instances
3. **Security:** Process variables can contain sensitive data - ensure proper access control
4. **Upgrades:** When upgrading Camunda, run migration scripts for database changes

---

## ✅ Next Steps

1. **Rebuild the project:**
   ```bash
   cd backend
   mvn clean install
   ```

2. **Start the application:**
   ```bash
   mvn spring-boot:run
   ```

3. **Access Camunda Cockpit:**
   ```
   http://localhost:8080/api/camunda/app/cockpit
   Login: admin / admin
   ```

4. **Test workflows** using the APIs or Tasklist UI

5. **Customize BPMN models** using Camunda Modeler

---

**The project now has enterprise-grade workflow automation! 🎉**
