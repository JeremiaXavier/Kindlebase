import { create } from 'zustand';
import { collection, doc, setDoc, getDocs, deleteDoc, Timestamp, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Adjust the path if needed
import { useAuthStore, User } from './useAuthStore';
import { EventInput } from '@fullcalendar/core/index.js';

export interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  // Store userId within the event document
  start: string;    // ISO String
  end?: string;    // ISO String
  allDay: boolean;
  date:string;
  extendedProps: {
    calendar: string;
  };
  
}

interface EventState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent,"id" | "createdAt" | "date">) => Promise<void>;
  updateEvent: (date:string,eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (date:string,eventId: string) => Promise<void>;
}

const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  fetchEvents: async () => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; // Get authUser from authStore
    const { events} = get();
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      console.log("authUser cannot get");
      return; // Or redirect to login
    }
    if(events && events.length>0){
      console.log("avoids database call event is not empty");
      return;
    }else{
      console.log("event not find");
    }
    try {
      // Query the 'events' collection, filtering by userId
      const eventsRef = collection(db, 'events',authUser.uid,"dailyEvents",);
      const querySnapshot = await getDocs(eventsRef);
      let allEvents: CalendarEvent[] = [];

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        const date = doc.id;
        if(eventData.events){
          const eventsWithDate = eventData.events.map((event:any)=>({
            ...event,
            date,
          }));
          allEvents = [...allEvents, ...eventsWithDate]
        }

        console.log(eventData);
        
      });
      set({ events: allEvents, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
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
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const newEventId = crypto.randomUUID();
      const newEvent: CalendarEvent = {
        id: newEventId,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        date: currentDate,
        extendedProps: event.extendedProps,
        // Add any other properties from your CalendarEvent interface here
      };
      const dayEventsRef = doc(db, 'events',authUser.uid,"dailyEvents",currentDate); // Use the 'events' collection
      const dayEventSnap = await getDoc(dayEventsRef)

      if(dayEventSnap.exists()){
        const existingEvents = dayEventSnap.data().events||[];
        await updateDoc(dayEventsRef,{
          events:[...existingEvents,newEvent],
        });
      }else{
        await setDoc(dayEventsRef,{events:[newEvent]});
      }

      set((state) => ({
        events: [...state.events, newEvent], // Add the *new* event, with the generated ID
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.log(error.message);
      throw error; // Re-throw to be caught by the caller
    }
  },
  updateEvent: async (date,eventId, updatedEvent) => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; // Get authUser
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      return; // Or handle error
    }

    try {
      const dayDocRef = doc(db, 'events',authUser.uid,"dailyEvents",date); //  Use eventId
      const dayDocSnap = await getDoc(dayDocRef);
      
      //  handle updates to start and end.
      if(!dayDocSnap.exists()){
        throw new Error("Event not Found");
      }
      const events = dayDocSnap.data().events as CalendarEvent[];
      const eventIndex = events.findIndex((ev)=>ev.id===eventId) 
      if(eventIndex === -1){
        throw new Error("Event not Found");
      }
      events[eventIndex]={...events[eventIndex],...updatedEvent};
/*       const updateData: Partial<CalendarEvent> = { ...updates }; */
      /* if (updates.start) {
        updateData.start = Timestamp.fromDate(new Date(updates.start));
      }
      if (updates.end && updates.end !== null) {
        updateData.end = Timestamp.fromDate(new Date(updates.end));
      } else if (updates.end === null) {
        updateData.end = null;
      } */
      await updateDoc(dayDocRef, {events});
      set(state => ({
        events: state.events.map((event) =>
          event.id === eventId ? { ...event, ...updatedEvent } : event
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  deleteEvent: async (date,eventId) => {
    set({ loading: true, error: null });
    const authUser = useAuthStore.getState().authUser; //get authUser
    if (!authUser) {
      set({ loading: false, error: "User not authenticated" });
      return; // Or handle error
    }
    try {
      const dayDocRef = doc(db, 'events',authUser.uid, "dailyEvents", date); // Use eventId
      const dayDocSnap = await getDoc(dayDocRef);
      if(!dayDocSnap.exists()){
        throw new Error("Event not found");
      }
      const events = dayDocSnap.data().events as CalendarEvent[];
      const updatedEvents = events.filter((ev)=>ev.id !==eventId);
      await updateDoc(dayDocRef,{events:updatedEvents});
      set((state) => ({ events: state.events.filter(event => event.id !== eventId), loading: false }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.log(error.message);
      throw error;
    }
  },
}));

export default useEventStore;
