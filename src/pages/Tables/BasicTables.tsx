import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import BasicTableOne from "@/components/tables/BasicTables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { PencilIcon } from "@/icons";
import CreateTaskModal from "@/components/models/TaskCreator";
import { useState } from "react";

/* interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  category?: string;
} */

export default function BasicTables() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  return (
    <>
      <PageMeta
        title="Kindlebase"
        description="This is a todo list in kindlebase"
      />
      <PageBreadcrumb pageTitle="" />

      <div className="space-y-6">
        <ComponentCard title="Tasks">
          <Button
            size="sm"
            variant="outline"
            startIcon={<PencilIcon className="size-5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create
          </Button>
          <CreateTaskModal
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            
          />

          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
