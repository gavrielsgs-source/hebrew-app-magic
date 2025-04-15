
import { TasksTable } from "@/components/tasks/TasksTable";

export default function Tasks() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        <TasksTable />
      </div>
    </div>
  );
}
