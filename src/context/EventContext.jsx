import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "./AuthContext";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const data = await apiRequest("/events");
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const data = await apiRequest("/attendance");
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const createEvent = async (event) => {
    try {
      const data = await apiRequest("/events", {
        method: "POST",
        body: JSON.stringify(event),
      });
      await fetchEvents();
      return true;
    } catch (error) {
      console.error("Failed to create event:", error);
      alert(error.message || "Failed to create event");
      return false;
    }
  };

  const updateEvent = async (id, changes) => {
    try {
      await apiRequest(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      await fetchEvents();
      return true;
    } catch (error) {
      console.error("Failed to update event:", error);
      return false;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await apiRequest(`/events/${id}`, {
        method: "DELETE",
      });
      await fetchEvents();
      return true;
    } catch (error) {
      console.error("Failed to delete event:", error);
      return false;
    }
  };

  const registerForEvent = async (eventId, userId) => {
    try {
      await apiRequest("/registrations", {
        method: "POST",
        body: JSON.stringify({ student_id: userId, event_id: eventId }),
      });
      await fetchRegistrations();
      return true;
    } catch (error) {
      console.error("Failed to register:", error);
      return false;
    }
  };

  const isRegistered = (eventId, userId) => {
    return registrations.some(
      (item) => (item.event_id === eventId || item.eventId === eventId) && (item.student_id_record === userId || item.userId === userId || item.student_id === userId)
    );
  };

  const getRegistrations = (userId) => {
    return registrations.filter(
      (item) => item.student_id_record === userId || item.userId === userId || item.student_id === userId
    );
  };

  return (
    <EventContext.Provider value={{ events, registrations, createEvent, updateEvent, deleteEvent, registerForEvent, isRegistered, getRegistrations, refreshEvents: fetchEvents, refreshRegistrations: fetchRegistrations }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvents must be used inside EventProvider");
  return context;
}
