
-- Drop the existing constraints first
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_type_check;

-- Update any invalid status values to 'pending'
UPDATE public.tasks 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in_progress', 'completed', 'cancelled') OR status IS NULL;

-- Update any invalid type values to 'task'
UPDATE public.tasks 
SET type = 'task' 
WHERE type NOT IN ('task', 'call', 'meeting', 'follow_up') OR type IS NULL;

-- Now add the constraints with the correct valid values
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE public.tasks ADD CONSTRAINT tasks_type_check 
CHECK (type IN ('task', 'call', 'meeting', 'follow_up'));
