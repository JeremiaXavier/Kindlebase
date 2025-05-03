import { create } from "zustand";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/firebase";
import { User } from "./useAuthStore";

export type Task = {
  id: string;
  title: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  category?: string;
  createdAt: Timestamp;
  date:string;
};

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  addTaskLoading: boolean;
  updateTaskLoading: boolean;
  deleteTaskLoading: boolean;
  fetchTasks: (authUser: User | null) => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "createdAt"|"date">,
    authUser: User | null
  ) => Promise<void>;
  updateTask: (
    date: string,
    taskId: string,
    updatedTask: Partial<Task>,
    authUser: User | null
  ) => Promise<void>;
  deleteTask: (
    date: string,
    taskId: string,
    authUser: User | null
  ) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  addTaskLoading: false,
  updateTaskLoading: false,
  deleteTaskLoading: false,

  fetchTasks: async (authUser) => {
    set({ loading: true });
    const {tasks} = get();
    if (!authUser) {
      set({ tasks: [], loading: false });
      return;
    }
    if(tasks && tasks.length>0){
      console.log("avoids database call task is not empty");
      return;
    }else{
      console.log("task is fetched");
    }
    try {
      const userTasksRef = collection(db, "tasks", authUser.uid, "dailyTasks");
      const snapshot = await getDocs(userTasksRef);
      let allTasks: Task[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const date = docSnap.id;
        if (data.tasks) {
          const tasksWithDate = data.tasks.map((task: any) => ({
            ...task,
            date,
          }));
          allTasks = [...allTasks, ...tasksWithDate];
        }
      });

      set({ tasks: allTasks, loading: false });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ loading: false });
      throw error;
    }
  },

  addTask: async (task, authUser) => {
    set({ addTaskLoading: true });
    if (!authUser) {
      set({ addTaskLoading: false });
      throw new Error("User not logged in");
    }

    try {
      const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const taskId = crypto.randomUUID();
      const newTask: Task = {
        id: taskId,
        ...task,
        createdAt: Timestamp.now(),
        date,
      };

      const dayDocRef = doc(db, "tasks", authUser.uid, "dailyTasks", date);
      const dayDocSnap = await getDoc(dayDocRef);

      if (dayDocSnap.exists()) {
        const existingTasks = dayDocSnap.data().tasks || [];
        await updateDoc(dayDocRef, {
          tasks: [...existingTasks, newTask],
        });
      } else {
        await setDoc(dayDocRef, { tasks: [newTask] });
      }

      set((state) => ({
        tasks: [newTask, ...state.tasks],
        addTaskLoading: false,
      }));
    } catch (error) {
      console.error("Error adding task:", error);
      set({ addTaskLoading: false });
      throw error;
    }
  },

  updateTask: async (date, taskId, updatedTask, authUser) => {
    set({ updateTaskLoading: true });
    
    try {
      const dayDocRef = doc(db, "tasks", authUser.uid, "dailyTasks", date);
      const dayDocSnap = await getDoc(dayDocRef);

      if (!dayDocSnap.exists()) {
        set({ updateTaskLoading: false });
        throw new Error("Task not found");
      }

      const tasks = dayDocSnap.data().tasks as Task[];
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        set({ updateTaskLoading: false });
        throw new Error("Task not found");
      }

      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };

      await updateDoc(dayDocRef, { tasks });

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, ...updatedTask } : t
        ),
        updateTaskLoading: false,
      }));
    } catch (error) {
      console.error("Error updating task:", error);
      set({ updateTaskLoading: false });
      throw error;
    }
  },

  deleteTask: async (date, taskId, authUser) => {
    set({ deleteTaskLoading: true });
    if (!authUser) {
      set({ deleteTaskLoading: false });
      throw new Error("User not logged in");
    }

    try {
      const dayDocRef = doc(db, "tasks", authUser.uid, "dailyTasks", date);
      const dayDocSnap = await getDoc(dayDocRef);

      if (!dayDocSnap.exists()) {
        set({ deleteTaskLoading: false });
        throw new Error("Task not found");
      }

      const tasks = dayDocSnap.data().tasks as Task[];
      const updatedTasks = tasks.filter((t) => t.id !== taskId);

      await updateDoc(dayDocRef, { tasks: updatedTasks });

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        deleteTaskLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
      set({ deleteTaskLoading: false });
      throw error;
    }
  },
}));
