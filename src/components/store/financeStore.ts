import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { create } from "zustand";
import { db } from "@/firebase";

export type Transaction = {
  id: string;

  amount: number;
  type: string;
  category?: string;
  date: string;
};
export type Goal = {
  id: string | null;

  name: string;
  goalType: string;
  targetAmount?: number;
  currentAmount?: number;
  deadLine: { seconds: number };
  date: string;
};
interface FinanceStore {
  transactions: Transaction[];
  goals: Goal[];
  loading: boolean;
  addTransactionloading: boolean;
  updateTransactionloading: boolean;
  deleteTransactionloading: boolean;
  fetchTransaction: () => Promise<void>; //  Remove user parameter
  addTransaction: (
    transaction: Omit<Transaction, "id" | "date">
  ) => Promise<void>; // Remove user parameter
  updateTransaction: (
    date: string,
    transactionId: string,
    updatedTransaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (date: string, transactionId: string) => Promise<void>;
  fetchGoal: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (
    date: string,
    goalId: string,
    updatedGoal: Partial<Goal>
  ) => Promise<void>;
  deleteGoal: (date: string, goalId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  goals: [],
  loading: false,
  addTransactionloading: false,
  updateTransactionloading: false,
  deleteTransactionloading: false,

  fetchTransaction: async () => {
    set({ loading: true });
    const authUser = useAuthStore.getState().authUser;
    const { transactions } = get();
    if (!authUser) {
      set({ transactions: [], loading: false });
      return;
    }
    if (transactions && transactions.length > 0) {
      console.log("avoids database call transactions is not empty");
      return;
    } else {
      console.log("transaction not find");
    }
    try {
      const financeRef = collection(
        db,
        "finance",
        authUser.uid,
        "dailyTransactions"
      );
      const querySnapshot = await getDocs(financeRef);
      let allTransactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        const transactionData = doc.data();
        const date = doc.id;
        if (transactionData.transactions) {
          const transactionWithDate = transactionData.transactions.map(
            (transaction) => ({
              ...transaction,
              date,
            })
          );
          allTransactions = [...allTransactions, ...transactionWithDate];
        }
      });

      set({ transactions: allTransactions, loading: false });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      set({ loading: false });
      throw error;
    }
  },

  addTransaction: async (transaction) => {
    set({ addTransactionloading: true });
    // Get user from authStore
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      // Handle the case where the user is not logged in
      set({ addTransactionloading: false });
      throw new Error("User not logged in");
    }
    try {
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const newTransactionId = crypto.randomUUID();
      const newTransaction: Transaction = {
        id: newTransactionId,
        ...transaction,
        date: currentDate,
        // Use user.uid
      };
      const dayDocRef = doc(
        db,
        "finance",
        authUser.uid,
        "dailyTransactions",
        currentDate
      );
      const dayDocSnap = await getDoc(dayDocRef);
      if (dayDocSnap.exists()) {
        const existingTransactions = dayDocSnap.data().transactions || [];
        await updateDoc(dayDocRef, {
          transactions: [...existingTransactions, newTransaction],
        });
      } else {
        await setDoc(dayDocRef, { transactions: [newTransaction] });
      }

      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        addTransactionloading: false,
      }));
    } catch (error) {
      console.error("Error adding transactions:", error);
      set({ addTransactionloading: false });
      throw error;
    }
  },

  updateTransaction: async (date, transactionId, updatedTransaction) => {
    set({ updateTransactionloading: true });
    const authUser = useAuthStore.getState().authUser; // Get authUser
    if (!authUser) {
      set({ loading: false });
      return; // Or handle error
    }
    /* const currentTransaction = get().transactions; */

    try {
      const dayDocRef = doc(
        db,
        "finance",
        authUser.uid,
        "dailyTransactions",
        date
      );
      const dayDocSnap = await getDoc(dayDocRef);

      if (!dayDocSnap.exists()) {
        throw new Error("Event not Found");
      }

      const transactions = dayDocSnap.data().transactions as Transaction[];
      const transactionIndex = transactions.findIndex(
        (t) => t.id === transactionId
      );
      if (transactionIndex === -1) {
        throw new Error("Transaction not found");
      }
      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        ...updatedTransaction,
      };
      await updateDoc(dayDocRef, { transactions });
      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, ...updatedTransaction }
            : transaction
        ),
        updateTransactionloading: true,
      }));
      set({ updateTransactionloading: false });
    } catch (error) {
      console.error("Error updating transaction:", error);

      // 3. If Firestore update fails, revert to the original task data
      /* if (originalTransaction) {
        // only revert if originalTask was found
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...originalTransaction }
              : transaction
          ),
        }));
      } */
      throw error;
    }
  },

  deleteTransaction: async (date, transactionId) => {
    set({ deleteTransactionloading: true });
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      set({ loading: false });
      return; // Or handle error
    }

    try {
      const dayDocRef = doc(
        db,
        "finance",
        authUser.uid,
        "dailyTransactions",
        date
      );
      const dayDocSnap = await getDoc(dayDocRef);

      if (!dayDocSnap.exists()) {
        throw new Error("Event not Found");
      }
      const transactions = dayDocSnap.data().transactions as Transaction[];
      const updatedTransaction = transactions.filter(
        (t) => t.id !== transactionId
      );
      await updateDoc(dayDocRef, { transactions: updatedTransaction });
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== transactionId),
      }));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      set({ deleteTransactionloading: false });

      throw error;
    }
  },
  /* Goal section */
  fetchGoal: async () => {
    set({ loading: true });
    const authUser = useAuthStore.getState().authUser;
    const { goals } = get();
    if (!authUser) {
      set({ goals: [], loading: false });
      return;
    }
    if (goals && goals.length > 0) {
      console.log("avoids database call goals is not empty");
      return;
    } else {
      console.log("goals not find");
    }
    try {
      const goalRef = collection(db, "finance", authUser.uid, "dailyGoals");
      const querySnapshot = await getDocs(goalRef);
      let allGoals: Goal[] = [];

      querySnapshot.forEach((doc) => {
        const goalData = doc.data();
        const date = doc.id;
        if (goalData.events) {
          const goalsWithDate = goalData.goals.map((goal) => ({
            ...goal,
            date,
          }));
          allGoals = [...allGoals, ...goalsWithDate];
        }
      });
      set({ goals: allGoals });
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching goals:", error);
      set({ loading: false });
      throw error;
    }
  },

  addGoal: async (goal) => {
    set({ addTransactionloading: true });
    const authUser = useAuthStore.getState().authUser;
    // Get user from authStore
    if (!authUser) {
      // Handle the case where the user is not logged in
      set({ addTransactionloading: false });
      throw new Error("User not logged in");
    }
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const newgoalId = crypto.randomUUID();
      const newGoal: Goal = {
        id: newgoalId,
        ...goal,
        date: currentDate,
      };
      const dayDocRef = doc(
        db,
        "finance",
        authUser.uid,
        "dailyGoals",
        currentDate
      );
      const dayDocSnap = await getDoc(dayDocRef);

      if (dayDocSnap.exists()) {
        const existingGoals = dayDocSnap.data().goals || [];
        await updateDoc(dayDocRef, {
          goals: [...existingGoals, newGoal],
        });
      } else {
        await setDoc(dayDocRef, { goals: [newGoal] });
      }
      /* 
      const docRef = await addDoc(collection(db, "goals"), newGoal);
      const addedGoal = { ...newGoal, id: docRef.id }; */
      set((state) => ({
        goals: [newGoal, ...state.goals],
        addTransactionloading: false,
      }));
    } catch (error) {
      console.error("Error adding transactions:", error);
      set({ addTransactionloading: false });
      throw error;
    }
  },

  updateGoal: async (date, goalId, updatedGoal) => {
    set({ updateTransactionloading: true });
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      set({ loading: false });
      return; // Or handle error
    }

    try {
      const dayDocRef = doc(db, "finance", authUser.uid, "dailyGoals", date); //  Use eventId
      const dayDocSnap = await getDoc(dayDocRef);
      /* originalGoal = currentGoal.find((goal) => goal.id === id);
      if (!originalGoal) {
        set({ updateTransactionloading: false });
        throw new Error("Goal not found");
      } */

      /*  if (authUser && originalGoal.userId !== authUser.uid) {
        set({ updateTransactionloading: false });
        throw new Error("Unauthorized");
      } */
      if (!dayDocSnap.exists()) {
        throw new Error("Event not Found");
      }
      // 2. Optimistically update the task in the store

      const goals = dayDocSnap.data().goals as Goal[];
      const goalIndex = goals.findIndex((g) => g.id === goalId);
      if (goalIndex === -1) {
        throw new Error("Goal is not found");
      }
      goals[goalIndex] = { ...goals[goalIndex], ...updatedGoal };
      await updateDoc(dayDocRef, { goals });
      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId ? { ...goal, ...updatedGoal } : goal
        ),
        updateTransactionloading: true,
      }));
      set({ updateTransactionloading: false });
    } catch (error) {
      console.error("Error updating transaction:", error);
      set({ updateTransactionloading: false });
      // 3. If Firestore update fails, revert to the original task data
      /* if (originalGoal) {
        // only revert if originalTask was found
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...originalGoal } : goal
          ),
        }));
      } */
      throw error;
    }
  },

  deleteGoal: async (date, goalId) => {
    set({ deleteTransactionloading: true });
    const authUser = useAuthStore.getState().authUser; //get authUser
    if (!authUser) {
      set({ loading: false });
      return; // Or handle error
    }
    try {
      // Optimistic Update
      const dayDocRef = doc(db, "finance", authUser.uid, "dailyGoals", date); //  Use eventId
      const dayDocSnap = await getDoc(dayDocRef);
      if (!dayDocSnap.exists()) {
        throw new Error("Event not found");
      }
      const goals = dayDocSnap.data().goals as Goal[];
      const updatedGoals = goals.filter((g) => g.id !== goalId);
      await updateDoc(dayDocRef, { goals: updatedGoals });

      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== goalId),
        deleteTransactionloading: true,
      }));
      set({ deleteTransactionloading: false });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      set({ deleteTransactionloading: false });
      throw error;
    }
  },
}));
