import { create } from "zustand";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  where,
  startAfter,
  runTransaction,
  documentId,
} from "firebase/firestore";
import { db } from "@/firebase"; // Adjust the path if needed
import { useAuthStore, User } from "./useAuthStore"; // Import UserData and useAuthStore (adjust path if needed)

interface CommunityData {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[];
  createdAt: string;
  bannerUrl: string;
}

interface ForumState {
  myCommunities: CommunityData[];
  communities: CommunityData[];
  
  loading: boolean;
  error: string | null;
  
 
  createCommunity: (
    communityData: Omit<CommunityData, "id"|"creatorId"|"createdAt"|"members">,
    userId: string
  ) => Promise<void>;
  joinCommunity: (communityId: string, userId: string) => Promise<void>;
  leaveCommunity: (communityId: string, userId: string) => Promise<void>;
  getCommunities: () => Promise<void>;
  getMyCommunities: () => Promise<void>;
  
}

const useForumStore = create<ForumState>((set, get) => ({
  
  myCommunities: [],
  communities: [],
  loading: false,
  error: null,
 
  createCommunity: async (communityData, userId) => {
    set({ loading: true, error: null });
    try {
      const communityId = `community-${crypto.randomUUID()}`;
      const communityDocRef = doc(db, "communities", communityId);
      const userDocRef = doc(db, "users", userId);
  
      await runTransaction(db, async (transaction) => {
        // ✅ READ FIRST
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist.");
        }
  
        const userData = userDoc.data() as User;
  
        // ✅ THEN WRITE
        transaction.set(communityDocRef, {
          id: communityId,
          name: communityData.name,
          description: communityData.description,
          bannerUrl: communityData.bannerUrl,
          creatorId: userId,
          members: [userId],
          createdAt: new Date().toISOString(),
        });
  
        transaction.update(userDocRef, {
          createdCommunities: [
            ...(userData.createdCommunities || []),
            communityId,
          ]
        });
      });
  
      const newCommunity: CommunityData = {
        id: communityId,
        name: communityData.name,
        description: communityData.description,
        creatorId: userId,
        bannerUrl: communityData.bannerUrl,
        members: [userId],
        createdAt: new Date().toISOString(),
      };
      const { setUser, authUser } = useAuthStore.getState();

      if (authUser) {
        setUser({
          ...authUser,
          createdCommunities: [...authUser.createdCommunities, communityId],
         
        });
      }
      set((state) => ({
        communities: [...state.communities, newCommunity],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  joinCommunity: async (id, userId) => {
    set({ loading: true, error: null });
    try {
      const communityDocRef = doc(db, "communities", id);
      const userDocRef = doc(db, "users", userId);

      await runTransaction(db, async (transaction) => {
        const communityDoc = await transaction.get(communityDocRef);
        const userDoc = await transaction.get(userDocRef);

        if (communityDoc.exists()) {
          const communityData = communityDoc.data() as CommunityData;
          if (!communityData.members.includes(userId)) {
            transaction.update(communityDocRef, {
              members: [...communityData.members, userId],
            });
          }
        }

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (!userData.joinedCommunities.includes(id)) {
            transaction.update(userDocRef, {
              joinedCommunities: [...(userData.joinedCommunities || []), id],
            });
          }
        }
      });
     const { setUser, authUser } = useAuthStore.getState();
     if (authUser) {
        setUser({
          ...authUser,
          joinedCommunities: [...authUser.joinedCommunities, id],
         
        });
    }
      set((state) => ({
        communities: state.communities.map((comm) =>
          comm.id === id
            ? { ...comm, members: [...comm.members, userId] }
            : comm
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  leaveCommunity: async (id: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const communityDocRef = doc(db, "communities", id);
      const userDocRef = doc(db, "users", userId);

      await runTransaction(db, async (transaction) => {
        const communityDoc = await transaction.get(communityDocRef);
        const userDoc = await transaction.get(userDocRef);

        if (communityDoc.exists()) {
          const communityData = communityDoc.data() as CommunityData;
          const updatedMembers = communityData.members.filter(
            (memberId) => memberId !== userId
          );
          transaction.update(communityDocRef, { members: updatedMembers });
        }

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          const updatedJoinedCommunities = userData.joinedCommunities.filter(
            (cId) => cId !== id
          );
          transaction.update(userDocRef, {
            joinedCommunities: updatedJoinedCommunities,
          });
        }
      });
      const authUser = useAuthStore.getState().authUser;
      set((state) => ({
        user: authUser
          ? {
              ...authUser,
              joinedCommunities: authUser.joinedCommunities.filter(
                (cId) => cId !== id
              ),
            }
          : null,
        communities: state.communities.map((comm) =>
          comm.id === id
            ? { ...comm, members: comm.members.filter((mId) => mId !== userId) }
            : comm
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  getCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const authUser = useAuthStore.getState().authUser;
      if (!authUser) {
        const errorMessage = "User not authenticated";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }

      const communitiesRef = collection(db, "communities");
      const excludedCommunityIds = [
        ...(authUser.joinedCommunities || []),
        ...(authUser.createdCommunities || []),
      ];

      const snapshot = await getDocs(communitiesRef);
      const fetchedCommunities: CommunityData[] = snapshot.docs
        .filter((doc) => !excludedCommunityIds.includes(doc.id))
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            creatorId: data.creatorId,
            members: data.members,
            createdAt: data.createdAt,
            bannerUrl: data.bannerUrl,
          };
        });

      set({ communities: fetchedCommunities, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getMyCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const authUser = useAuthStore.getState().authUser;
      if (!authUser) {
        const errorMessage = "User not authenticated";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage); // Explicitly throw for consistent error handling
      }

      // Optimize:  Use a Set for efficient de-duplication *before* fetching
      const communityIdSet = new Set([
        ...(authUser.joinedCommunities || []),
        ...(authUser.createdCommunities || []),
      ]);
      const communityIds = Array.from(communityIdSet); // Convert back to array for fetching

      if (communityIds.length === 0) {
        set({ myCommunities: [], loading: false }); // Handle the case where there are no communities
        return;
      }

      const communitiesRef = collection(db, "communities");
      const myCommunities: CommunityData[] = [];

      // Handle the case where there are more than 10 IDs
      if (communityIds.length > 10) {
        // Split the IDs into chunks of 10
        const chunks = [];
        for (let i = 0; i < communityIds.length; i += 10) {
          chunks.push(communityIds.slice(i, i + 10));
        }

        // Fetch communities for each chunk
        for (const chunk of chunks) {
          const q = query(communitiesRef, where(documentId(), "in", chunk));
          const snapshot = await getDocs(q);
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            myCommunities.push({
              id: doc.id,
              name: data.name,
              description: data.description,
              creatorId: data.creatorId,
              members: data.members,
              createdAt: data.createdAt,
              bannerUrl: data.bannerUrl,
            });
          });
        }
      } else {
        // If there are 10 or fewer IDs, use a single query
        const q = query(
          communitiesRef,
          where(documentId(), "in", communityIds)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          myCommunities.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            creatorId: data.creatorId,
            members: data.members,
            createdAt: data.createdAt,
            bannerUrl: data.bannerUrl,
          });
        });
      }
      set({ myCommunities, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useForumStore;
