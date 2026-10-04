import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "./AuthContext";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => {
    try {
      const cached = localStorage.getItem("um_tap_cached_events");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [registrations, setRegistrations] = useState(() => {
    try {
      const cached = localStorage.getItem("um_tap_cached_registrations");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      const data = await apiRequest("/events");
      setEvents(data);
      localStorage.setItem("um_tap_cached_events", JSON.stringify(data));
    } catch (error) {
      console.warn("Could not fetch latest events from network, keeping cached dataset:", error);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    try {
      const data = await apiRequest("/attendance");
      setRegistrations(data);
      localStorage.setItem("um_tap_cached_registrations", JSON.stringify(data));
    } catch (error) {
      console.warn("Could not fetch latest registrations from network, keeping cached passes:", error);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    
    apiRequest("/events")
      .then((data) => {
        if (!ignore) {
          setEvents(data);
          localStorage.setItem("um_tap_cached_events", JSON.stringify(data));
        }
      })
      .catch((error) => {
        console.warn("Could not fetch latest events from network, keeping cached dataset:", error);
      });

    if (user) {
      apiRequest("/attendance")
        .then((data) => {
          if (!ignore) {
            setRegistrations(data);
            localStorage.setItem("um_tap_cached_registrations", JSON.stringify(data));
          }
        })
        .catch((error) => {
          console.warn("Could not fetch latest registrations from network, keeping cached passes:", error);
        });
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  const createEvent = async (event) => {
    try {
      await apiRequest("/events", {
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
