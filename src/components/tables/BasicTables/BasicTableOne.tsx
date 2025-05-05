import { useEffect, useState } from "react";
import { Task, useTaskStore } from "@/components/store/taskStore";
import { useAuthStore } from "@/components/store/useAuthStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge.tsx"; // Corrected import path
import Button from "@/components/ui/button/Button"; // Assuming there's a Button component
import CreateTaskModal from "@/components/models/TaskCreator";
import { CloseLineIcon, PencilIcon } from "@/icons";
import { useConfirmation } from "@/context/confirmProvider";



export default function BasicTableOne() {
  const { tasks, fetchTasks, deleteTask } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const {authUser} = useAuthStore();
  useEffect(() => {
    
    if(tasks&&tasks.length>0)
      return;
    console.log("task is fetched");
    fetchTasks(authUser);
    
  }, []);
  const showConfirmation = useConfirmation(); // Handle the delete action
  const handleDelete = (task:Task) => {
    showConfirmation({
      message: "Are you sure you want to delete this item?",
      title: "Delete Item",
      onConfirm: () => {
        deleteTask(task.date,task.id,authUser); // Perform delete operation
      },
      onCancel: () => {
        console.log('Deletion cancelled.');
    },
    });
  };
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null); // Task being edited

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setTaskToEdit(null); // Reset the task being edited
  };
  return (
    <>
      <CreateTaskModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        taskToEdit={taskToEdit}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Task
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Due Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Priority
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {task.title}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {task.dueDate}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        task.priority === "High"
                          ? "error"
                          : task.priority === "Medium"
                          ? "warning"
                          : "dark"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        task.status === "To Do"
                          ? "primary"
                          : task.status === "In Progress"
                          ? "warning"
                          : "success"
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {task.category}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(task)}
                    >
                      <PencilIcon className="size-5" />
                    </Button>
                    &nbsp;
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(task)}
                    >
                      <CloseLineIcon className="size-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
