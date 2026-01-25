-- Fix the database constraint to allow ON_HOLD status
-- Run this SQL script in your PostgreSQL database

-- For candidates table - update hiring_status constraint
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_hiring_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_hiring_status_check 
  CHECK (hiring_status IN ('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'ON_HOLD'));

-- For candidate_hiring_rounds table
ALTER TABLE candidate_hiring_rounds DROP CONSTRAINT IF EXISTS candidate_hiring_rounds_status_check;
ALTER TABLE candidate_hiring_rounds ADD CONSTRAINT candidate_hiring_rounds_status_check 
  CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED', 'ON_HOLD'));

-- For hiring_rounds table (interns)
ALTER TABLE hiring_rounds DROP CONSTRAINT IF EXISTS hiring_rounds_status_check;
ALTER TABLE hiring_rounds ADD CONSTRAINT hiring_rounds_status_check 
  CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'CANCELLED', 'ON_HOLD'));

-- Verify the constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%status_check%';
