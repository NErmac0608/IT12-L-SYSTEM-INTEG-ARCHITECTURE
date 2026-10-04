import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import EventCard from "../../components/EventCard";
import { useEvents } from "../../context/EventContext";
import { apiRequest } from "../../services/api";

function Events() {
  const { events } = useEvents(); 
  const [query, setQuery] = useState(""); 
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("All Departments");

  useEffect(() => {
    apiRequest("/departments")
      .then(data => setDepartments(data))
      .catch(err => console.error("Could not load departments", err));
  }, []);

  const filtered = useMemo(() => events.filter((event) => 
    `${event.title} ${event.description || ''}`.toLowerCase().includes(query.toLowerCase()) && 
    (department === "All Departments" || event.department === department)
  ), [events, query, department]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans text-[#111111]">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
        
        <header className="mb-8 border-b border-[#EAEAEA] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#102a43] mb-2">
            Event Calendar
          </h1>
          <p className="text-sm sm:text-base text-[#787774] max-w-xl">
            Discover upcoming activities, assemblies, and seminars across UM Tagum.
          </p>
        </header>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by event title..." 
              className="w-full bg-white border border-[#EAEAEA] rounded-xl !pl-10 !pr-3.5 !py-2.5 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors shadow-xs"
              style={{ paddingLeft: "2.6rem" }}
            />
          </div>
          
          <div className="relative w-full sm:w-72">
            <SlidersHorizontal size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
            <select 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-[#EAEAEA] rounded-xl !pl-10 !pr-8 !py-2.5 text-sm text-[#111111] appearance-none focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors shadow-xs cursor-pointer"
              style={{ paddingLeft: "2.6rem", paddingRight: "2rem" }}
            >
              <option value="All Departments">All Departments</option>
              {departments.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#787774] text-xs">▼</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        
        {!filtered.length && (
          <div className="py-16 text-center border border-[#EAEAEA] border-dashed rounded-2xl bg-white mt-4 p-6">
            <p className="text-[#787774] text-sm">No events match your current search.</p>
            <button 
              type="button"
              onClick={() => { setQuery(""); setDepartment("All Departments"); }}
              className="mt-3 text-xs font-bold text-[#102a43] hover:underline cursor-pointer"
            >
              Clear search filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
