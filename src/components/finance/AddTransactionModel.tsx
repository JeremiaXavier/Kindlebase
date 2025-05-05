import { Modal } from "@/components/ui/modal"; // Adjust import as needed

import { useEffect, useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { Transaction, useFinanceStore } from "../store/financeStore";
interface TransactionModelProps {
  isOpen: boolean;
  closeModal: () => void;
  transactionEdit?: Transaction | null;
}

export function AddTransactionModal({
  isOpen,
  closeModal,
  transactionEdit,
}: TransactionModelProps) {
  const { addTransaction, updateTransaction } = useFinanceStore();
  const [form, setForm] = useState<Omit<Transaction, "id" | "date">>({
    amount: 0,
    type: "",
    category: "",
  });
  useEffect(() => {
    if (transactionEdit) {
      console.log("Transaction",transactionEdit);
      setForm({
        amount: transactionEdit.amount,
        type: transactionEdit.type,
        category: transactionEdit.category,
      });
    }
  }, [transactionEdit]);

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (transactionEdit) {
        await updateTransaction(transactionEdit.date, transactionEdit.id, form);
      }else{
        await addTransaction(form);
      }
      closeModal();
      setForm({
        amount: 0,
        type: "",
        category: "",
      });
    } catch (error) {
      console.error("Error submitting form", error);

    }
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
                onChange={(e) =>
                  setForm({ ...form, amount: parseInt(e.target.value) })
                }
                placeholder="Enter amount"
                
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

          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {transactionEdit? "Update":"save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
