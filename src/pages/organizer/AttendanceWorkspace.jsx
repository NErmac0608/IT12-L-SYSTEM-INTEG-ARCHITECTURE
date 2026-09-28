import { Download, FileCheck2 } from "lucide-react";
import Button from "../../components/Button";
import { useEvents } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";

function AttendanceWorkspace() { 
  const { registrations } = useEvents(); 
  const { user } = useAuth();
  
  // Filter registrations for events this organizer manages (optional, but good practice). 
  // For now, we'll just show all from context assuming context fetches what they need, or just show all.
  // Actually, our API /attendance gets all. Let's just use what's in context.
  
  const exportCsv = () => { 
    const csv = ["Student,Email,Event,Status", ...registrations.map((row) => `${row.full_name || row.student_name},${row.school_email || ''},${row.event_title},${row.status}`)].join("\n"); 
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); 
    const link = document.createElement("a"); 
    link.href = url; 
    link.download = "attendance.csv"; 
    link.click(); 
    URL.revokeObjectURL(url); 
  }; 
  
  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Organizer workspace</p>
          <h1>Attendance</h1>
          <p className="muted">Review live registration states and export a CSV report.</p>
        </div>
        <Button onClick={exportCsv}><Download size={16} /> Export CSV</Button>
      </div>
      
      <div className="table-card">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Event</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((row) => (
                <tr key={row.qr_token || `${row.student_id}-${row.event_id}`}>
                  <td>
                    <strong>{row.full_name || row.student_name}</strong>
                    <br/><small className="text-gray-500">{row.school_email}</small>
                  </td>
                  <td>{row.event_title}</td>
                  <td>
                    <span className={`status ${row.status.toLowerCase()}`}>
                      <FileCheck2 size={14} />{row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan="3" style={{textAlign: "center", padding: "2rem"}}>No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ); 
}
export default AttendanceWorkspace;
