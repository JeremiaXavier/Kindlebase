import { create } from 'zustand';
import { collection, doc, setDoc, getDocs, deleteDoc, Timestamp, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Adjust the path if needed
import { useAuthStore, User } from './useAuthStore';
import { EventInput } from '@fullcalendar/core/index.js';

export interface CalendarEvent extends EventInput {
  id: string;
  title: string;
   userId: string|undefined; // Store userId within the event document
  start: string;    // ISO String
  end?: string;    // ISO String
  allDay: boolean;
  extendedProps: {
    calendar: string;
  };
  
}

interface EventState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  addEvent: (event: CalendarEvent) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  fetchEvents: async () => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; // Get authUser from authStore
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      console.log("authUser cannot get");
      return; // Or redirect to login
    }
    try {
      // Query the 'events' collection, filtering by userId
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where("userId", "==", authUser.uid));
      const querySnapshot = await getDocs(q);
      const fetchedEvents: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        // Convert Firestore Timestamps to ISO strings
        /* const start = (eventData.start instanceof Timestamp) ? eventData.start.toDate().toISOString() : eventData.start;
        const end = (eventData.end instanceof Timestamp) ? eventData.end?.toDate().toISOString() : eventData.end; */
        console.log(eventData);
        fetchedEvents.push({
          id: doc.id,
          title: eventData.title,
          userId: eventData.userId, // Get userId from the document
          start: eventData.start,
          end: eventData.end,
          allDay: eventData.allDay,
          extendedProps: { calendar: eventData.extendedProps.calendar ||"" },
          
        });
      });
      set({ events: fetchedEvents, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  addEvent: async (event) => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; // Get authUser
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      return; // Or redirect to login
    }
    try {
      const eventsRef = collection(db, 'events'); // Use the 'events' collection
      const newEventRef = doc(eventsRef);  // Firestore will generate a unique ID
      const newEventId = newEventRef.id;

      // Convert start and end dates to Firestore Timestamps
/*       const startTimestamp = Timestamp.fromDate(new Date(event.start));
      const endTimestamp = event.end ? Timestamp.fromDate(new Date(event.end)) : null; */

      const eventData = {
        id:newEventId,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        extendedProps: { calendar: event.extendedProps.calendar||"" },
        
        userId: authUser.uid,
      };

      await setDoc(newEventRef, eventData); // Use the newEventRef
      set(state => ({
        events: [...state.events, { ...event, id: newEventId }], // Add the *new* event, with the generated ID
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.log(error.message);
      throw error; // Re-throw to be caught by the caller
    }
  },
  updateEvent: async (eventId, updates) => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; // Get authUser
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      return; // Or handle error
    }

    try {
      const eventRef = doc(db, 'events', eventId); //  Use eventId
      //  handle updates to start and end.
      const updateData: Partial<CalendarEvent> = { ...updates };
      /* if (updates.start) {
        updateData.start = Timestamp.fromDate(new Date(updates.start));
      }
      if (updates.end && updates.end !== null) {
        updateData.end = Timestamp.fromDate(new Date(updates.end));
      } else if (updates.end === null) {
        updateData.end = null;
      } */
      await updateDoc(eventRef, updateData);
      set(state => ({
        events: state.events.map(event =>
          event.id === eventId ? { ...event, ...updates } : event
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; //get authUser
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      return; // Or handle error
    }
    try {
      const eventRef = doc(db, 'events', eventId); // Use eventId
      await deleteDoc(eventRef);
      set(state => ({ events: state.events.filter(event => event.id !== eventId), loading: false }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.log(error.message);
      throw error;
    }
  },
}));

export default useEventStore;
