import { useEffect, useState } from "react";

/** ===== Helpers ===== **/
const startOfDayKey = (d) => {
  const dt = new Date(d);
  const t = dt.getTime();
  if (Number.isNaN(t)) return null; // invalid / missing date
  dt.setHours(0, 0, 0, 0);          // normalize to local midnight
  return dt.getTime();
};
const todayKey = startOfDayKey(new Date());

const API_BASE = "http://localhost:5000/api/events"; // adjust if your backend port changes

export default function App() {
  /** ===== State ===== **/
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [filter, setFilter] = useState("all"); // all | upcoming | past
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /** ===== CRUD: Read ===== **/
useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);  // ✅ just API_BASE
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
      setErr("");
    } catch (e) {
      setErr("Failed to load events.");
    } finally {
      setLoading(false);
    }
  })();
}, []);

  /** ===== CRUD: Create ===== **/
  const handleAdd = async () => {
    if (!title.trim() || !date.trim()) return;
    try {
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date }),
      });
      if (!res.ok) throw new Error("Create failed");
      const newEvent = await res.json();
      setEvents((prev) => [...prev, newEvent]);
      setTitle("");
      setDate("");
      setErr("");
    } catch (e) {
      setErr("Could not add event.");
    }
  };

  /** ===== CRUD: Delete ===== **/
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setErr("");
    } catch (e) {
      setErr("Could not delete event.");
    }
  };

  /** ===== CRUD: Enter Edit Mode ===== **/
  const handleEdit = (event) => {
    setEditingId(event._id);
    setEditTitle(event.title);
    // Robust for any stored date format
    const ymd = new Date(event.date).toISOString().slice(0, 10);
    setEditDate(ymd);
  };

  /** ===== CRUD: Update ===== **/
  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editDate.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, date: editDate }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setEditingId(null);
      setErr("");
    } catch (e) {
      setErr("Could not update event.");
    }
  };

  /** ===== Filtering + Search + Sorting ===== **/
  const filteredEvents = events
    .map((e) => ({ ...e, _dayKey: startOfDayKey(e.date) }))
    .filter((e) => {
      if (filter === "upcoming") return e._dayKey !== null && e._dayKey >= todayKey;
      if (filter === "past") return e._dayKey !== null && e._dayKey < todayKey;
      return true; // "all"
    })
    .filter((e) => e.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a._dayKey ?? Infinity) - (b._dayKey ?? Infinity));

  /** ===== UI ===== **/
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        🎉 Event Manager
      </h1>

      {/* Add Form Card */}
      <div className="max-w-xl mx-auto bg-white shadow-md p-6 rounded-2xl mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Event</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        {err && <p className="text-red-600 mt-3">{err}</p>}
      </div>

      {/* Filters */}
      <div className="max-w-xl mx-auto flex flex-wrap justify-center gap-3 mb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 rounded ${
            filter === "upcoming" ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 rounded ${
            filter === "past" ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Past
        </button>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm w-full md:w-1/2"
        />
      </div>

      {/* Loading / Empty / List */}
      <div className="max-w-xl mx-auto mt-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading events…</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">No events found for this filter.</p>
        ) : (
          <ul className="space-y-4">
            {filteredEvents.map((event) => {
              const isUpcoming = (event._dayKey ?? -1) >= todayKey;
              return (
                <li
                  key={event._id}
                  className="p-4 bg-white shadow-md rounded-2xl flex justify-between items-center border hover:shadow-lg transition"
                >
                  {editingId === event._id ? (
                    // Edit Mode
                    <div className="flex flex-col gap-2 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="border p-2 rounded w-full"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="border p-2 rounded w-full"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdate(event._id)}
                          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-gray-800">{event.title}</h2>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isUpcoming
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {isUpcoming ? "Upcoming" : "Past"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {new Date(event.date).toDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          ❌ Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
