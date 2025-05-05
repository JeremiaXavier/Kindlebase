import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button/Button";

import { AddTransactionModal } from "@/components/finance/AddTransactionModel";
import { useTheme } from "@/context/ThemeContext";
import {  Transaction, useFinanceStore } from "@/components/store/financeStore";
import { useConfirmation } from "@/context/confirmProvider";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = React.lazy(() => import("react-apexcharts"));
// Sample data




export default function FinanceDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  /* const [goals, setGoals] = useState(""); */
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction| null>(null);
  const {
    transactions,
    
    fetchTransaction,
    
    deleteTransaction,
    
  } = useFinanceStore();
  useEffect(() => {
    if (transactions && transactions.length === 0) {
      fetchTransaction();
    }
  }, []);
 


  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");

  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expense.reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Pie Chart Data
  const expenseCategories = expense.reduce((acc, curr): { [key: string]: number } => {
    const category = curr.category ?? 'uncategorized'; // Provide a default
    acc[category] = (acc[category] || 0) + Number(curr.amount);
    return acc;
  }, {} as { [key: string]: number });

  const pieLabels = Object.keys(expenseCategories);
  const pieSeries = Object.values(expenseCategories);
  const { theme } = useTheme();

  // Bar Chart Config
  const barOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: theme === "dark" ? "#1e293b" : "#fff", // Match chart background to dark mode
    },
    plotOptions: { bar: { borderRadius: 4 } },
    xaxis: { categories: ["Income", "Expense"] },
    colors: ["#22c55e", "#ef4444"],
    theme: { mode: theme },
    grid: {
      borderColor: theme === "dark" ? "#2a2a2a" : "#e5e7eb", // Dark mode grid lines
    },
    yaxis: {
      labels: {
        style: {
          colors: theme === "dark" ? "#e5e7eb" : "#000", // Y-axis label color based on theme
        },
      },
    },
    title: {
      text: "Income vs Expense",
      align: "center",
      style: {
        color: theme === "dark" ? "#e5e7eb" : "#000", // Title text color
      },
    },
  };
  const pieOptions = {
    labels: pieLabels,
    theme: { mode: theme },
    legend: {
      position: "bottom",
      labels: {
        colors: theme === "dark" ? "#e5e7eb" : "#000", // Legend text color
      },
    },
    chart: {
      background: theme === "dark" ? "#1e293b" : "#fff", // Match chart background to dark mode
    },
  };
  const handleEditTransaction = async (transaction: Transaction|null) => {
    setSelectedTransaction(transaction);

    setIsModalOpen(true);
  };
  const takeConfirmation = useConfirmation();
  const handleDeleteTransaction =async(transaction: Transaction)=>{
    takeConfirmation({
      message: "Are you sure you want to delete this transaction?",
      title: "Confirm Deletion",
      onConfirm: () => {
        deleteTransaction(transaction.date,transaction.id); // Perform delete operation
      },
      onCancel: () => {
        console.log('Deletion cancelled.');
    },
    });
   
  }
  return (
    <div>
      <PageMeta
        title="Kindlebase"
        description="Track your income and expenses"
      />
      <PageBreadcrumb pageTitle="Finance Dashboard" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-black/[0.2]">
            <p className="text-sm text-gray-500 dark:text-gray-300">Income</p>
            <h2 className="text-xl font-semibold text-green-600 mt-2">
              ₹{totalIncome}
            </h2>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-black/[0.2]">
            <p className="text-sm text-gray-500 dark:text-gray-300">Expense</p>
            <h2 className="text-xl font-semibold text-red-500 mt-2">
              ₹{totalExpense}
            </h2>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-black/[0.2]">
            <p className="text-sm text-gray-500 dark:text-gray-300">Balance</p>
            <h2 className="text-xl font-semibold text-blue-600 mt-2">
              ₹{balance}
            </h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-black/[0.2]">
            <h4 className="text-sm font-medium mb-2 dark:text-white/90">
              Income vs Expense
            </h4>
            <ReactApexChart
              options={barOptions}
              series={[{ name: "Amount", data: [totalIncome, totalExpense] }]}
              type="bar"
              height={250}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-black/[0.2]">
            <h4 className="text-sm font-medium mb-2 dark:text-white/90">
              Expense by Category
            </h4>
            {pieSeries.length > 0 ? (
              <ReactApexChart
                options={pieOptions}
                series={pieSeries}
                type="pie"
                height={250}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No expense data yet.
              </p>
            )}
          </div>
        </div>

     

        {/* Add Transaction Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsModalOpen(true)}>Add Transaction</Button>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold mb-2 dark:text-white">
            Recent Transactions
          </h4>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No transactions yet.
            </p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b py-2 text-sm dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-700 dark:text-white/90">
                    {tx.category}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tx.date}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}₹{tx.amount}
                </span>
                <div className="flex space-x-2">
                  {" "}
                  {/* Container for the buttons */}
                  <button
                    onClick={() => handleEditTransaction(tx)}
                    className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(tx)}
                    className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-100 focus:outline-none focus:ring focus:ring-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        closeModal={() => {
          setSelectedTransaction(null);
          setIsModalOpen(false);
        }}
        transactionEdit={selectedTransaction}
      />
    </div>
  );
}
