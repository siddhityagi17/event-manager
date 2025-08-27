import { useEffect, useState } from "react";
import API from "../api";
API.get("/events")

export default function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get("/events").then(res => setEvents(res.data));
  }, []);

  const rsvp = async (id) => {
    const name = prompt("Enter your name to RSVP:");
    if (name) {
      await API.post(`/events/${id}/rsvp`, { attendee: name });
      alert("RSVP successful!");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Upcoming Events</h1>
      {events.map(event => (
        <div key={event._id} className="border p-3 my-2 rounded">
          <h2 className="text-lg">{event.title}</h2>
          <p>{new Date(event.date).toDateString()}</p>
          <p>{event.location}</p>
          <button 
            onClick={() => rsvp(event._id)} 
            className="bg-blue-500 text-white px-3 py-1 rounded">
            RSVP
          </button>
        </div>
      ))}
    </div>
  );
}
