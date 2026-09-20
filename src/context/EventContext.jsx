import { createContext, useContext, useState } from "react";
import { initialEvents } from "../data/mockData";

const EventContext = createContext(null);
const eventsKey = "event-attendance-events";
const registrationsKey = "event-attendance-registrations";

function readStorage(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => readStorage(eventsKey, initialEvents));
  const [registrations, setRegistrations] = useState(() => readStorage(registrationsKey, []));

  const persistEvents = (nextEvents) => {
    setEvents(nextEvents);
    localStorage.setItem(eventsKey, JSON.stringify(nextEvents));
  };

  const createEvent = (event) => {
    const nextEvent = { ...event, id: Date.now() };
    persistEvents([nextEvent, ...events]);
    return nextEvent;
  };

  const updateEvent = (id, changes) => {
    persistEvents(events.map((event) => (event.id === id ? { ...event, ...changes } : event)));
  };

  const deleteEvent = (id) => persistEvents(events.filter((event) => event.id !== id));

  const registerForEvent = (eventId, userId) => {
    if (registrations.some((item) => item.eventId === eventId && item.userId === userId)) return false;
    const next = [...registrations, { eventId, userId, status: "Registered", registeredAt: new Date().toISOString() }];
    setRegistrations(next);
    localStorage.setItem(registrationsKey, JSON.stringify(next));
    return true;
  };

  const isRegistered = (eventId, userId) => registrations.some((item) => item.eventId === eventId && item.userId === userId);
  const getRegistrations = (userId) => registrations.filter((item) => item.userId === userId);

  return (
    <EventContext.Provider value={{ events, registrations, createEvent, updateEvent, deleteEvent, registerForEvent, isRegistered, getRegistrations }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvents must be used inside EventProvider");
  return context;
}
