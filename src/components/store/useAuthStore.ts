import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.ts";

export interface User {
  bio?: string;
  displayName: string|null;
  email: string|null;
  facebook?: string|null;
  instagram?: string|null;
  linkedin?: string|null;
  
  phoneNumber?: string|null;
  photoURL?: string|null;
  provider?: string|null;
  twitter?: string|null;
  emailVerified?:boolean|null;
  uid: string|null;
  createdCommunities?: string[]|null;
  joinedCommunities?: string[]|null;

  role?: string;
}

interface AuthState {
  authUser: User | null;
  setUser: (authUser: User | null) => void;
  fetchUserData: (uid: string) => Promise<void>;
  logOut:()=>Promise<void>
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
  logOut:async()=>{
    set(()=>({
      authUser:null,
    }))
  }
}));
