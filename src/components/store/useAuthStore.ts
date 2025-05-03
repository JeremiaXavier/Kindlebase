import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.ts";

export interface User {
  bio?: string;
  createdAt: string;
  displayName: string;
  email: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  name: string;
  phoneNumber: string;
  photoURL: string;
  provider: string;
  twitter: string;
  uid: string;
  createdCommunities: string[];
  joinedCommunities: string[];

  role: string;
}

interface AuthState {
  authUser: User | null;
  setUser: (authUser: User | null) => void;
  fetchUserData: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Specify the type here
  authUser: null,
  setUser: (authUser) => set({ authUser }),

  fetchUserData: async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as User;
      set({
        authUser: {
          ...userData, // Add the additional fields (facebook, twitter, etc.)
          uid, // Make sure you add UID to the user data
        },
      });
    }
  },
}));
