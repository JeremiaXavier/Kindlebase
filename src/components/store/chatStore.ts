import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentData,
  arrayUnion,
  query,
  increment,
  getDoc,
  setDoc,
  FieldValue,
} from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the path if needed
//import { v4 as uuidv4 } from 'uuid'; // Removed uuidv4 import

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string | FieldValue;
  likes: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string | FieldValue;
  likes: number;
  replies: Reply[];
}

interface ChatStore {
  posts: Post[];
  loading: boolean;
  error: string | null;

  fetchPosts: (communityId: string) => Promise<void>;
  createPost: (
    content: string,
    userId: string,
    userName: string,
    userAvatar: string,
    communityId: string
  ) => Promise<void>;
  addReply: (
    postId: string,
    replyData: Omit<Reply, "id">,
    communityId: string | null
  ) => Promise<void>;
  likePost: (postId: string, communityId: string) => Promise<void>;
  likeReply: (
    postId: string,
    replyId: string,
    communityId: string
  ) => Promise<void>;
  lastFetchedMessageDoc: any | null;
  hasMoreMessages: boolean;
  loadMoreMessages: (communityId: string) => Promise<void>;
  resetMessages: (communityId: string) => void;
  logoutChat:()=>Promise<void>
}

const useChatStore = create<ChatStore>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  lastFetchedMessageDoc: null,
  hasMoreMessages: true,
  resetMessages: (communityId) => {
    set({ posts: [], lastFetchedMessageDoc: null, hasMoreMessages: true });
  },
  fetchPosts: async (communityId) => {
    set({ loading: true, error: null });

    if (!communityId) {
      set({ loading: false, error: "Community ID is not set." });
      return;
    }
    try {
      const communityDocRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);

      // If the community document doesn't exist, create it.
      if (!communityDoc.exists()) {
        await setDoc(communityDocRef, {});
      }
      const messagesRef = collection(communityDocRef, "messages"); // Corrected

      const q = query(messagesRef, orderBy("timestamp", "asc"), limit(10)); // limit
      const snapshot = await getDocs(q);

      const fetchedPosts: Post[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          content: data.content,
          timestamp: data.timestamp
            ? data.timestamp.toDate().toLocaleString()
            : "",
          likes: data.likes || 0,
          replies: (data.replies || []).map((reply: any) => ({
            id: reply.id,
            userId: reply.userId,
            userName: reply.userName,
            userAvatar: reply.userAvatar,
            content: reply.content,
            timestamp: typeof reply.timestamp === 'string'
            ? reply.timestamp
            : reply.timestamp
            ? reply.timestamp.toDate().toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
              })
            : "",
            likes: reply.likes || 0,
          })),
        };
      });
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      set({
        posts: fetchedPosts, // State update
        loading: false, // State update
        lastFetchedMessageDoc: lastDoc,
        hasMoreMessages: snapshot.docs.length === 10,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.log(error.message); // State update
    }
  },
  loadMoreMessages: async (communityId) => {
    const { lastFetchedMessageDoc, hasMoreMessages, loading } = get();
    if (!communityId || !hasMoreMessages || loading) return;

    set({ loading: true, error: null });
    try {
      /* const postsRef = collection(db, 'communities', communityId, 'chat');
      const chatDoc = await getDocs(postsRef);

       if (chatDoc.empty) {
        await addDoc(postsRef, {});
      } */

      const communityDocRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);

      if (!communityDoc.exists()) {
        await setDoc(communityDocRef, {});
      }

      const messagesRef = collection(communityDocRef, "messages"); // Corrected
      const q = query(
        messagesRef,
        orderBy("timestamp", "asc"), // Keep the same order
        startAfter(lastFetchedMessageDoc),
        limit(10)
      );
      const snapshot = await getDocs(q);

      const fetchedPosts: Post[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          content: data.content,
          timestamp: data.timestamp
            ? data.timestamp.toDate().toLocaleString()
            : "",
          likes: data.likes || 0,
          replies: (data.replies || []).map((reply: any) => ({
            id: reply.id,
            userId: reply.userId,
            userName: reply.userName,
            userAvatar: reply.userAvatar,
            content: reply.content,
            timestamp: reply.timestamp
              ? reply.timestamp.toDate().toLocaleString()
              : "",
            likes: reply.likes || 0,
          })),
        };
      });
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const newPosts = [...get().posts, ...fetchedPosts];
      set({
        posts: newPosts,
        loading: false,
        lastFetchedMessageDoc: lastDoc,
        hasMoreMessages: snapshot.docs.length === 10,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  createPost: async (content, userId, userName, userAvatar, communityId) => {
    if (!communityId) {
      set({ error: "Community ID is not set." });
      throw new Error("Community ID is not set.");
    }
    try {
    
      const communityDocRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);
      if (!communityDoc.exists()) {
        await setDoc(communityDocRef, {});
      }
      const messagesRef = collection(communityDocRef, "messages"); // Corrected

      const newPost: Omit<Post, "id" | "timestamp" | "likes" | "replies"> = {
        userId,
        userName,
        userAvatar,
        content,
      };

      const docRef = await addDoc(messagesRef, {
        ...newPost,
        timestamp: serverTimestamp(),
        likes: 0,
        replies: [],
      });

      const createdPost: Post = {
        id: docRef.id,
        ...newPost,
        timestamp: new Date().toLocaleString(),
        likes: 0,
        replies: [],
      };

      set((state) => ({
        posts: [...state.posts, createdPost],
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  addReply: async (postId, replyData, communityId) => {
    if (!communityId) {
      set({ error: "Community ID is not set." });
      throw new Error("Community ID is not set.");
    }
    try {
      /* const postsRef = collection(db, 'communities', communityId, 'chat');
      const chatDoc = await getDocs(postsRef);
      if (chatDoc.empty) {
        await addDoc(postsRef, {});
      } */
      const communityDocRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);
      if (!communityDoc.exists()) {
        await setDoc(communityDocRef, {});
      }
      const messagesRef = collection(communityDocRef, "messages"); // Corrected
      const postRef = doc(messagesRef, postId);

      const newReply: Reply = {
        id: crypto.randomUUID(),
        ...replyData,
        timestamp: new Date().toLocaleString(),
        likes: 0,
      };

      await updateDoc(postRef, {
        replies: arrayUnion(newReply),
      });
      const newReplyForDisplay: Reply = {
        id: newReply.id,
        userId: newReply.userId,
        userName: newReply.userName,
        userAvatar: newReply.userAvatar,
        content: newReply.content,
        timestamp: new Date().toLocaleString(),
        likes: 0,
      };

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, replies: [...post.replies, newReplyForDisplay] }
            : post
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  likePost: async (postId, communityId) => {
    if (!communityId) {
      set({ error: "Community ID is not set." });
      throw new Error("Community ID is not set.");
    }
    try {
      /* const postsRef = collection(db, 'communities', communityId, 'chat');
      const chatDoc = await getDocs(postsRef);
      if (chatDoc.empty) {
        await addDoc(postsRef, {});
      } */
      const communityDocRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);
      if (!communityDoc.exists()) {
        await setDoc(communityDocRef, {});
      }
      const messagesRef = collection(communityDocRef, "messages"); // Corrected
      const postRef = doc(messagesRef, postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  likeReply: async (postId, replyId, communityId) => {
    if (!communityId) {
      set({ error: "Community ID is not set." });
      throw new Error("Community ID is not set.");
    }
    try {
      const communityDocRef = doc(db, "communities", communityId); // Corrected
      const communityDoc = await getDoc(communityDocRef);
      if (!communityDoc.exists()) {
        await setDoc(communityDocRef, {});
      }
      const messagesRef = collection(communityDocRef, "messages");
      const postRef = doc(messagesRef, postId);
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }
      const postData = postDoc.data();
      const replies = postData.replies || [];

      const updatedReplies = replies.map((reply: Reply) =>
        reply.id === replyId
          ? { ...reply, likes: (reply.likes || 0) + 1 }
          : reply
      );

      await updateDoc(postRef, { replies: updatedReplies });

      set((state) => ({
        posts: state.posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              replies: post.replies.map((reply) =>
                reply.id === replyId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              ),
            };
          }
          return post;
        }),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  logoutChat:async()=>{
    set(()=>({
      posts:[],
    }))
  }
}));

export default useChatStore;
