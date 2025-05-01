import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Task, useTaskStore } from "@/components/store/taskStore";
import Select from "../form/Select";

// 🟢 Task type

interface TaskModalProps {
  isOpen: boolean;
  closeModal: () => void;
  taskToEdit?: Task; // Task to edit, if any
}

export default function CreateTaskModal({
  isOpen,
  closeModal,
  taskToEdit,
}: TaskModalProps) {
  const [form, setForm] = useState<Omit<Task, "id" | "createdAt">>({
    title: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
    category: "",
  });

  const { addTask, updateTask } = useTaskStore(); // 🟢 Get actions from store

  // Populate form with existing task data if editing
  useEffect(() => {
    if (taskToEdit) {
      setForm({
        title: taskToEdit.title,
        dueDate: taskToEdit.dueDate,
        priority: taskToEdit.priority,
        status: taskToEdit.status,
        category: taskToEdit.category || "",
      });
    }
  }, [taskToEdit]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (taskToEdit) {
        // Update existing task
        await updateTask(taskToEdit.id, form);
      } else {
        // Add new task
        await addTask(form);
      }
      closeModal();
      setForm({
        title: "",
        dueDate: "",
        priority: "Medium",
        status: "To Do",
        category: "",
      });
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {taskToEdit ? "Edit Task" : "Create New Task"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {taskToEdit ? "Modify the task details below." : "Fill in the task details below."}
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSave}>
          <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  options={[
                    { value: "Low", label: "Low" },
                    { value: "Medium", label: "Medium" },
                    { value: "High", label: "High" },
                  ]}
                  placeholder="Select Priority"
                  value={form.priority}
                  onChange={(value) =>
                    setForm({ ...form, priority: value as Task["priority"] })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  options={[
                    { value: "To Do", label: "To Do" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Completed", label: "Completed" },
                  ]}
                  placeholder="Select Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm({ ...form, status: value as Task["status"] })
                  }
                />
              </div>
              <div className="lg:col-span-2">
                <Label>Category</Label>
                <Input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {taskToEdit ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
