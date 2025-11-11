-- Update the tasks table type constraint to include 'test'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_type_check;

ALTER TABLE tasks ADD CONSTRAINT tasks_type_check 
CHECK (type IN ('task', 'call', 'meeting', 'follow_up', 'test'));