# Research Flow Smoke Test

## Prereqs
- Run DB container and ensure enum values exist:
   - `docker exec -it b2b_postgres psql -U postgres -d backend -c "ALTER TYPE research_tasks_status_enum ADD VALUE IF NOT EXISTS 'IN_PROGRESS';"`
   - `docker exec -it b2b_postgres psql -U postgres -d backend -c "ALTER TYPE research_tasks_status_enum ADD VALUE IF NOT EXISTS 'SUBMITTED';"`
- Start backend: `cd backend && npm run start:dev`
- Start frontend: `cd frontend && npm run dev`
- Use provided demo users (password: admin123).

## Steps
1. **Load website tasks**
   - Login as `web_res@test.com`.
   - GET `/research/tasks/website?categoryId=<your-category>` should return tasks with `assignedToUserId` and status `unassigned`.

2. **Claim a task**
   - Click a task → Claim.
   - Backend log should show `[claimTask] START` and `assignedToUserId` set.
   - DB check: `SELECT id,status,"assignedToUserId" FROM research_tasks WHERE id='<taskId>';` should show status `IN_PROGRESS`.
   - UI color: task renders **yellow**.

3. **Submit for audit**
   - Fill company name/country/language → Submit.
   - Backend log `[submitTaskData] START` with userId.
   - DB check: `SELECT * FROM research_submissions WHERE researchtaskid='<taskId>';` returns new row.
   - Task status in DB becomes `SUBMITTED`; UI shows **green** confirmation and waits for “Understood.”

4. **Auditor pending list**
   - Login as auditor (e.g., `web_aud@test.com`).
   - GET `/audit/research/pending` should list the submitted task with submission data.

5. **Approve path**
   - POST `/audit/research/<taskId>` with `{ decision: 'APPROVED' }`.
   - DB: task status `COMPLETED`.
   - Researcher refresh should no longer see the task.

6. **Reject path**
   - Submit another task, then POST `/audit/research/<taskId>` with `{ decision: 'REJECTED', rejectionReasonId: 'manual' }`.
   - DB: task status `IN_PROGRESS` and still assigned to the same user.
   - Researcher refresh should show task again in **yellow** with existing assignment.

## Expected Colors
- **Red**: unassigned (assignedToUserId null)
- **Yellow**: assigned to current user, status in progress
- **Green**: submitted (temporary confirmation until “Understood” removes locally)
