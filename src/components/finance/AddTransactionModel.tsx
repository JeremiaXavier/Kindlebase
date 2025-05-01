import { Modal } from "@/components/ui/modal"; // Adjust import as needed

import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";

export function AddTransactionModal({ isOpen, closeModal, onSubmit }) {
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    closeModal();
    setForm({
      amount: "",
      type: "expense",
      category: "",
      description: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
      <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Add Transaction
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Fill in the transaction details below.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                defaultValue={form.type}
                options={[
                  { value: "expense", label: "Expense" },
                  { value: "income", label: "Income" },
                ]}
                onChange={(value) => setForm({ ...form, type: value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Groceries, Salary"
              />
            </div>
            <div className="lg:col-span-2">
              <Label>Description</Label>
              <TextArea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
