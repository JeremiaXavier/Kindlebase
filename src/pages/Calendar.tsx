import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
// Import your Firestore instance

import useEventStore, { CalendarEvent } from "@/components/store/calenderStore";
import { useConfirmation } from "@/context/confirmProvider";
import { CogIcon } from "lucide-react";

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const { events, fetchEvents, addEvent, updateEvent, deleteEvent } =
    useEventStore();
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("09:00"); // Default start time
  const [eventEndTime, setEventEndTime] = useState("17:00"); // Default end time
  const [eventLevel, setEventLevel] = useState("Primary");

  /*   const [events, setEvents] = useState<CalendarEvent[]>([]);
   */ const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    if (!events || events.length === 0) {
      // Check if events are not yet in the store
      fetchEvents();
      console.log("events fetched");
    }
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr.split("T")[0]);
    /* if (selectInfo.endStr) {
      setEventEndDate(selectInfo.endStr.split("T")[0]);
    } else { */
      setEventEndDate(selectInfo.startStr.split("T")[0]);
   /*  } */

    // If it's an all-day event in month view, default time.
    if (!selectInfo.allDay) {
      const start = selectInfo.start;
      const end = selectInfo.end;
      setEventStartTime(start.toTimeString().slice(0, 5));
      setEventEndTime(end.toTimeString().slice(0, 5));
    } else {
      setEventStartTime("09:00");
      setEventEndTime("17:00");
    }
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    let eventDate = "";

    // Find the event in the events array to get the date
    const foundEvent = events.find((e) => e.id === event.id); // Use events from zustand
    if (foundEvent) {
      eventDate = foundEvent.date;
     }

    setSelectedEvent({
      title:event.title,
      start:event.start ? event.startStr.split("T")[0] : "",
      end:event.end ? event.endStr.split("T")[0] : "",
      allDay:event.allDay,
      extendedProps:{calendar:event.extendedProps.calender},// Use type assertion here
      date: eventDate,
      id:event.id,
    });
    console.log("clicked Event:",selectedEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start ? event.startStr.split("T")[0] : "");
    setEventEndDate(event.end ? event.endStr.split("T")[0] : "");
    setEventStartTime(
      event.start ? event.start.toTimeString().slice(0, 5) : "09:00"
    ); // Extract time
    setEventEndTime(event.end ? event.end.toTimeString().slice(0, 5) : "17:00"); // Extract time
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };
  const takeConfirmation = useConfirmation();
  const handleDelete = async () => {
    
    
    if (selectedEvent) {
      takeConfirmation({
        message: "Are you sure you want to delete this transaction?",
        title: "Confirm Deletion",
        onConfirm: async() => {
          await deleteEvent(selectedEvent.date, selectedEvent.id); // Perform delete operation
        },
        onCancel: () => {
          console.log('Deletion cancelled.');
      },
      });
      closeModal();
    }
  };
  const handleAddOrUpdateEvent = async () => {
    let start = eventStartDate;
    let end = eventEndDate;

    if (!selectedEvent || !selectedEvent.allDay) {
      start += `T${eventStartTime}:00`;
      end = eventEndDate ? end + `T${eventEndTime}:00` : start;
    }

    try {
      if (selectedEvent) {
        // Update existing event
        console.log("selected Event", selectedEvent);
        const updatedEventData: Partial<CalendarEvent> = {
          // Change to Partial<CalendarEvent>
          title: eventTitle,

          start: start,
          end: end,
          allDay: !eventStartTime || !eventEndTime,
          extendedProps: { calendar: eventLevel || "" },
        };
        await updateEvent(
          selectedEvent.date,
          selectedEvent.id,
          updatedEventData
        ); // Pass authUser
      } else {
        // Add new event
        const newEvent: Omit<CalendarEvent, "id" | "createdAt" | "date"> = {
          title: eventTitle,
          start: start,
          end: end,

          allDay: !eventStartTime || !eventEndTime,
          extendedProps: { calendar: eventLevel || "" },
        };
        await addEvent(newEvent);
      }
      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Error adding/updating event:", error);
      //  show error to user
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventStartTime("09:00");
    setEventEndTime("17:00");
    setEventLevel("");
    setSelectedEvent(null);
  };
  console.log(events);
  return (
    <>
      <PageMeta title="Kindlebase" description="" />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth" // Use timeGrid view
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
                
              },
            }}
            initialDate={new Date()}
            slotMinTime="01:00:00" //set the starting time of the day
            slotMaxTime="24:00:00" // set the ending time of the day
            allDaySlot={false}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on
                track
              </p>
            </div>
            <div className="mt-8">
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                  eventLevel === key ? "block" : "hidden"
                                }`}
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Start Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Start Time
                </label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter End Date
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  End Time
                </label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleDelete}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Delete
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${
    eventInfo.event.extendedProps.calendar.toLowerCase() || ""
  }`;
  return (
    <div
      className={`event-fc-color  flex flex-col fc-event-main w-full ${colorClass}  rounded-sm`}
    >
      <div className="fc-event-time">{eventInfo.timeText}m</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
