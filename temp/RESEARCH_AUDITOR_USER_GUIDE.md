# Research Auditor Feature - User Guide

## Overview

The B2B Action Workforce Control System now includes a dedicated **Research Auditor** role for reviewing and validating researcher submissions independently from Inquirer audits.

---

## Roles

### Four Auditor Roles Available

#### Inquirer Auditors (Existing)
- **website_inquirer_auditor**: Reviews inquiry actions, screenshots, and outreach from website inquirers
- **linkedin_inquirer_auditor**: Reviews inquiry actions, screenshots, and outreach from LinkedIn inquirers

#### Research Auditors (New)
- **website_research_auditor**: Reviews data submissions from website researchers
- **linkedin_research_auditor**: Reviews data submissions from LinkedIn researchers

---

## Access Paths

### For Inquirer Auditors
- **Website Auditor Dashboard:** `/auditor/website/dashboard`
- **Website Pending Reviews:** `/auditor/website/pending`
- **LinkedIn Auditor Dashboard:** `/auditor/linkedin/dashboard`
- **LinkedIn Pending Reviews:** `/auditor/linkedin/pending`

### For Research Auditors
- **Website Research Dashboard:** `/auditor-researcher/website/dashboard`
- **Website Research Reviews:** `/auditor-researcher/website/pending`
- **LinkedIn Research Dashboard:** `/auditor-researcher/linkedin/dashboard`
- **LinkedIn Research Reviews:** `/auditor-researcher/linkedin/pending`

---

## Research Auditor Workflow

### 1. Dashboard Overview
The Research Auditor Dashboard displays:
- **Pending Reviews**: Count of submissions awaiting review
- **Approved Submissions**: Count of approved submissions
- **Rejected Submissions**: Count of rejected submissions
- **Average Review Time**: Metric for review speed
- **Queue Status**: Current research submissions waiting for audit
- **Submissions by Category**: Breakdown of submissions across categories

### 2. Pending Review Page

#### What Researchers Submit
Research Auditors review researcher-submitted data:

**Website Research Submission:**
- Language (optional)
- Tech Stack (optional)
- Email (optional)
- Phone (optional)
- Notes (optional)

**LinkedIn Research Submission:**
- Contact Name (required)
- Contact LinkedIn URL (required)
- Country (required)
- Language (required)
- Notes (optional)

#### Audit Decision Process

1. **Open the Target**
   - Click the target link to view the website domain or LinkedIn profile
   - Links open in a new browser tab
   - Auditor verifies data submission accuracy against the target

2. **Review Submission Data**
   - Examine all submitted fields
   - Verify completeness and accuracy
   - Check for data quality and relevance

3. **Make a Decision**
   - **✓ Approve**: Submission meets quality standards
     - No feedback required
     - Submission marked as "approved"
     - Can be used by inquirers in next workflow step
   
   - **✕ Reject**: Submission does not meet standards
     - Feedback required (mandatory text field)
     - Explain why submission was rejected
     - Researcher can see feedback and resubmit

### 3. Decision Impact

**Approved Submissions:**
- Status: `approved`
- Available for use by corresponding Inquirer role
- Counted in approval metrics
- Contributes to researcher performance metrics

**Rejected Submissions:**
- Status: `rejected`
- Includes auditor feedback
- Researcher can resubmit improved data
- Does not count as completed submission

---

## Key Differences: Inquirer vs Research Auditors

| Aspect | Inquirer Auditor | Research Auditor |
|--------|------------------|------------------|
| **Reviews** | Inquiry actions, screenshots | Data submissions only |
| **Fields** | Domain details, action proof | Contact info, language, tech stack |
| **Decision** | Approve/Reject/Flag | Approve/Reject only |
| **Feedback** | Optional on all decisions | Required only for rejection |
| **Pages** | Dashboard, Pending, Flags, History | Dashboard, Pending |
| **Data Type** | Images, evidence | Text, URLs, structured data |

---

## Admin Management

### Creating Research Auditor Users

**Super Admin Panel:**
1. Go to Admin → Users → Create User
2. Select Role: `website_research_auditor` or `linkedin_research_auditor`
3. Assign Categories (same as other roles)
4. Create user

### Assigning Categories

Research Auditors are assigned to categories just like other roles:
- One auditor can review submissions across multiple categories
- One category can have multiple research auditors
- Category assignment controls which submissions they see

### Viewing Role Distribution

```sql
SELECT r.name, COUNT(ur.id) FROM roles r 
LEFT JOIN user_roles ur ON r.id = ur."roleId" 
GROUP BY r.id, r.name;
```

---

## Data Flow Integration

### Complete Workflow

```
1. RESEARCHER
   └─ Submits research data
      └─ Status: PENDING

2. RESEARCH AUDITOR
   ├─ Reviews submission
   ├─ Checks target accuracy
   └─ Decides: APPROVE or REJECT
      ├─ APPROVE → Status: APPROVED
      │  └─ Data available for Inquirers
      └─ REJECT → Status: REJECTED
         └─ Researcher sees feedback, can resubmit

3. INQUIRER (uses approved research)
   └─ Starts inquiry work with validated data
```

### Database Tables

- **research_tasks**: Task assignment and tracking
- **research_submissions**: Submitted data from researchers
- **user_roles**: Auditor role assignments

---

## Metrics & Reporting

### What Gets Tracked

- Submissions pending per research auditor
- Average review time per auditor
- Approval/rejection rate per auditor
- Submissions per category
- Performance metrics by auditor role

### Admin Dashboard Access

Super Admin can view:
- Total submissions by status
- Research auditor performance
- Category-based submission metrics
- Time-based trends

---

## Best Practices

### For Research Auditors

1. **Quick Review**: Use provided links to verify targets
2. **Consistent Standards**: Apply same quality criteria across submissions
3. **Meaningful Feedback**: On rejection, provide specific improvement guidance
4. **Efficient Processing**: Goal is to review all pending items regularly
5. **Category Focus**: Work efficiently within assigned categories

### For Admins

1. **Proper Assignment**: Assign auditors to appropriate categories
2. **Workload Balance**: Distribute submissions fairly across auditors
3. **Training**: Ensure auditors understand quality expectations
4. **Monitoring**: Review approval/rejection ratios regularly
5. **Support**: Provide feedback to auditors on performance

---

## Troubleshooting

### Research Auditor Can't See Submissions

**Check:**
1. User has `website_research_auditor` or `linkedin_research_auditor` role
2. User is assigned to at least one category
3. Research tasks exist in those categories
4. Submissions exist with `pending` status

### Links Don't Work

**Check:**
1. Target URL is valid (domain or LinkedIn profile)
2. Browser allows opening in new tabs
3. Network connection is active
4. Target still exists/is publicly accessible

### Feedback Not Required But Showing Error

**Check:**
1. You're rejecting (not approving)
2. Feedback field has text entered
3. No special characters causing issues

---

## Support

For issues or questions:
- Contact System Administrator
- Review this guide
- Check VERIFICATION_REPORT.md for system status
- Check AUDITOR_RESTRUCTURING_COMPLETE.md for implementation details

---

**Last Updated:** January 23, 2026  
**System Status:** ✅ Operational  
**Feature Status:** ✅ Live
