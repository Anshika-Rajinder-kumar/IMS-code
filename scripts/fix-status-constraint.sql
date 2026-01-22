-- Fix the interns_status_check constraint to include DOCUMENT_VERIFIED

-- Drop the old constraint
ALTER TABLE interns DROP CONSTRAINT IF EXISTS interns_status_check;

-- Add the new constraint with DOCUMENT_VERIFIED included
ALTER TABLE interns ADD CONSTRAINT interns_status_check 
CHECK (status IN (
    'DOCUMENT_PENDING',
    'DOCUMENT_VERIFICATION', 
    'DOCUMENT_VERIFIED',
    'INTERVIEW_SCHEDULED',
    'OFFER_GENERATED',
    'ONBOARDING',
    'ACTIVE',
    'COMPLETED',
    'TERMINATED'
));
