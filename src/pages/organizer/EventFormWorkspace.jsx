import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { useEvents } from "../../context/EventContext";
import { apiRequest } from "../../services/api";

const blank = { title: "", description: "", department_id: "", date: "", start_time: "", end_time: "", venue: "" };

function EventFormWorkspace() { 
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const { events, createEvent, updateEvent } = useEvents(); 
  
  const existing = events.find((event) => event.id === Number(id)); 
  
  // Transform existing view data (which has 'department' string) into what the form needs
  const [form, setForm] = useState(existing ? {
    title: existing.title || "",
    description: existing.description || "",
    department_id: existing.department_id || "", // Needs to map correctly if we had it, fallback below
    date: existing.event_date || existing.date || "",
    start_time: existing.start_time || "",
    end_time: existing.end_time || "",
    venue: existing.location || existing.venue || ""
  } : blank); 
  
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    apiRequest("/departments")
      .then(data => {
        setDepartments(data);
        // Pre-fill department ID if editing an existing event where we only know the department string name
        if (existing && existing.department && !form.department_id) {
          const matchedDept = data.find(d => d.name === existing.department);
          if (matchedDept) {
            setForm(current => ({ ...current, department_id: matchedDept.id }));
          }
        }
      })
      .catch(err => console.error("Could not fetch departments", err));
  }, [existing]);

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value })); 
  
  const submit = async (event) => { 
    event.preventDefault(); 
    
    let success = false;
    if (id) {
      success = await updateEvent(Number(id), form);
    } else {
      success = await createEvent(form); 
    }
    
    if (success) {
      navigate("/organizer/events"); 
    }
  }; 
  
  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Organizer workspace</p>
          <h1>{id ? "Edit event" : "Create event"}</h1>
          <p className="muted">Keep the details clear so students can make a quick decision.</p>
        </div>
      </div>
      
      <form className="form-card form-grid" onSubmit={submit}>
        {[
          ["title", "Event title"],
          ["venue", "Venue"],
          ["date", "Date"],
          ["start_time", "Start Time"],
          ["end_time", "End Time"]
        ].map(([key,label]) => (
          <label key={key}>
            {label}
            <input 
              required 
              value={form[key]} 
              type={key === "date" ? "date" : (key === "start_time" || key === "end_time") ? "time" : "text"} 
              onChange={(event) => change(key, event.target.value)} 
            />
          </label>
        ))}
        
        <label>Department
          <select required value={form.department_id} onChange={(event) => change("department_id", Number(event.target.value))}>
            <option value="" disabled>Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </label>
        
        <label className="full-field">Description
          <textarea required rows="5" value={form.description} onChange={(event) => change("description", event.target.value)} />
        </label>
        
        <div className="form-actions full-field">
          <Button type="submit">{id ? "Save changes" : "Publish event"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/organizer/events")}>Cancel</Button>
        </div>
      </form>
    </div>
  ); 
}

export default EventFormWorkspace;
