
import { TasksTable } from "@/components/tasks/TasksTable";
import { Sidebar } from "@/components/ui/sidebar";

export default function Tasks() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6">
        <TasksTable />
      </div>
    </div>
  );
}
