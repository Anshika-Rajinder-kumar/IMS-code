-- Consolidated stability fix for IMS
-- This script ensures all DB constraints match Java enums and allow ON_HOLD/INTERN types correctly.

-- 1. Fix user types to include INTERN
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
  CHECK (user_type IN ('ADMIN', 'HR', 'COLLEGE', 'INTERN'));

-- 2. Fix candidate hiring status
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_hiring_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_hiring_status_check 
  CHECK (hiring_status IN ('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'ON_HOLD'));

-- 3. Fix intern hiring status
ALTER TABLE interns DROP CONSTRAINT IF EXISTS interns_hiring_status_check;
ALTER TABLE interns ADD CONSTRAINT interns_hiring_status_check 
  CHECK (hiring_status IN ('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'ON_HOLD'));

-- 4. Fix candidate hiring rounds status
ALTER TABLE candidate_hiring_rounds DROP CONSTRAINT IF EXISTS candidate_hiring_rounds_status_check;
ALTER TABLE candidate_hiring_rounds ADD CONSTRAINT candidate_hiring_rounds_status_check 
  CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED', 'ON_HOLD'));

-- 5. Fix intern hiring rounds status
ALTER TABLE hiring_rounds DROP CONSTRAINT IF EXISTS hiring_rounds_status_check;
ALTER TABLE hiring_rounds ADD CONSTRAINT hiring_rounds_status_check 
  CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED', 'ON_HOLD'));

-- Verify constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname IN (
    'users_user_type_check', 
    'candidates_hiring_status_check', 
    'interns_hiring_status_check',
    'candidate_hiring_rounds_status_check',
    'hiring_rounds_status_check'
);
