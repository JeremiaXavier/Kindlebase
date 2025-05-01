import { create } from "zustand";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  Timestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/firebase.ts";
import { User } from "./useAuthStore";
// import { User } from "firebase/auth"; // Remove Firebase User
// Import from your authStore.ts

export type Task = {
  id: string | null;
  title: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  category?: string;
  createdAt?: Timestamp;
  userId: string; // Add userId field
};

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  addTaskLoading: boolean;
  updateTaskLoading: boolean;
  deleteTaskLoading: boolean;
  fetchTasks: (authUser) => Promise<void>; //  Remove user parameter
  addTask: (task: Omit<Task, "id">, authUser: User | null) => Promise<void>; // Remove user parameter
  updateTask: (
    id: string,
    updatedTask: Partial<Task>,
    authUser: User
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  addTaskLoading: false,
  updateTaskLoading: false,
  deleteTaskLoading: false,

  fetchTasks: async (authUser) => {
    set({ loading: true });
    const { tasks } = get();
    if (!authUser) {
      set({ tasks: [], loading: false });
      return;
    }
    if(tasks&&tasks.length>0){
      console.log("avoids database call task is not empty");
      return;
    }else{
      console.log("task not find");
    }
    try {
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", authUser.uid), // Use user.uid
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const tasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));
      set({ tasks, loading: false });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ loading: false });
      throw error;
    }
  },

  addTask: async (task, authUser) => {
    set({ addTaskLoading: true });
    // Get user from authStore
    if (!authUser) {
      // Handle the case where the user is not logged in
      set({ addTaskLoading: false });
      throw new Error("User not logged in");
    }
    try {
      const newTask: Task = {
        ...task,
        createdAt: Timestamp.now(),
        userId: authUser.uid, // Use user.uid
      };
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      const addedTask = { ...newTask, id: docRef.id };
      set((state) => ({
        tasks: [addedTask, ...state.tasks],
        addTaskLoading: false,
      }));
    } catch (error) {
      console.error("Error adding task:", error);
      set({ addTaskLoading: false });
      throw error;
    }
  },

  updateTask: async (id, updatedTask, authUser) => {
    
    set({ updateTaskLoading: true });
    let originalTask: Task | undefined;
    const currentTasks = get().tasks;

    try {
      // 1.  Take a copy of e task
      originalTask = currentTasks.find((task) => task.id === id);
      if (!originalTask) {
        set({ updateTaskLoading: false });
        throw new Error("Task not found");
      }

      if (originalTask.userId !== authUser.uid) {
        set({ updateTaskLoading: false });
        throw new Error("Unauthorized");
      }

      // 2. Optimistically update the task in the store
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        ),
        updateTaskLoading: true,
      }));

      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, updatedTask);

      set({ updateTaskLoading: false });
    } catch (error) {
      console.error("Error updating task:", error);
      set({ updateTaskLoading: false });
      // 3. If Firestore update fails, revert to the original task data
      if (originalTask) {
        // only revert if originalTask was found
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ?  { ...task, ...originalTask } : task
          ),
        }));
      }
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ deleteTaskLoading: true });
    const previousTasks = get().tasks;
    try {
      // Optimistic Update
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        deleteTaskLoading: true,
      }));
      await deleteDoc(doc(db, "tasks", id));
      set({ deleteTaskLoading: false });
    } catch (error) {
      console.error("Error deleting task:", error);
      set({ deleteTaskLoading: false });
      set({ tasks: previousTasks });
      throw error;
    }
  },
}));
