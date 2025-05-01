import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button/Button";

import { AddTransactionModal } from "@/components/finance/AddTransactionModel";
import { useTheme } from "@/context/ThemeContext";
import { PencilIcon, TrashBinIcon } from "@/icons";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = React.lazy(() => import("react-apexcharts"));
// Sample data
const sampleTransactions = [
  {
    id: 1,
    amount: 5000,
    type: "income",
    category: "Salary",
    date: "2025-05-01",
  },
  {
    id: 2,
    amount: 1200,
    type: "expense",
    category: "Groceries",
    date: "2025-05-02",
  },
];

const sampleGoals = [
  {
    id: 1,
    name: "Buy a Car",
    goalType: "Saving",
    targetAmount: 500000,
    currentAmount: 100000,
    deadline: { seconds: 1683408000 }, // Sample timestamp
  },
  {
    id: 2,
    name: "Vacation Fund",
    goalType: "Saving",
    targetAmount: 200000,
    currentAmount: 50000,
    deadline: { seconds: 1708908000 }, // Sample timestamp
  },
];

const GoalItem = ({ goal, onDelete, onUpdateProgress }) => {
  const { name, goalType, targetAmount, currentAmount, deadline } = goal;
  const progress = (currentAmount / targetAmount) * 100;

  return (
    <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            <strong>Type:</strong> {goalType}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            <strong>Target:</strong> ₹{targetAmount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            <strong>Current:</strong> ₹{currentAmount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            <strong>Deadline:</strong>{" "}
            {new Date(deadline.seconds * 1000).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateProgress(goal)}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            <PencilIcon className="h-4 w-4" />
            Update
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition"
          >
            <TrashBinIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Progress: {progress.toFixed(2)}%
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function FinanceDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [goals, setGoals] = useState(sampleGoals);

  const handleAddTransaction = (data) => {
    const newTransaction = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleAddGoal = (goalData) => {
    const newGoal = { id: Date.now(), ...goalData };
    setGoals([newGoal, ...goals]);
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleUpdateGoalProgress = (goalToUpdate) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalToUpdate.id 
        ? { ...goal, currentAmount: goal.currentAmount + 10000 } // Example: Increase progress
        : goal
    );
    setGoals(updatedGoals);
  };

  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");

  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expense.reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Pie Chart Data
  const expenseCategories = expense.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});
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

        {/* Goals Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 dark:text-white">
            Your Goals
          </h4>
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No goals set yet.</p>
          ) : (
            goals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onUpdateProgress={handleUpdateGoalProgress}
              />
            ))
          )}
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
