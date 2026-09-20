export const DEMO_PASSWORD = "demo";

export const demoUsers = [
  { id: 1, name: "Demo Student", username: "student", role: "student", department: "Information Technology" },
  { id: 2, name: "Demo Organizer", username: "organizer", role: "organizer", department: "College of Computing Education" },
  { id: 3, name: "Demo Admin", username: "admin", role: "admin", department: "Administration" },
];

export const initialEvents = [
  {
    id: 1,
    title: "IT Week 2026",
    description: "A week of talks, competitions, and community events for technology students.",
    department: "Information Technology",
    date: "2026-10-12",
    time: "9:00 AM - 5:00 PM",
    venue: "UM Tagum Gymnasium",
    organizer: "Demo Organizer",
    capacity: 250,
  },
  {
    id: 2,
    title: "Innovation Summit 2026",
    description: "Meet builders and thinkers shaping the next generation of digital products.",
    department: "Computer Science",
    date: "2026-10-20",
    time: "8:30 AM - 3:30 PM",
    venue: "University Auditorium",
    organizer: "Demo Organizer",
    capacity: 180,
  },
  {
    id: 3,
    title: "Cybersecurity Awareness Seminar",
    description: "Learn practical habits for protecting your identity, devices, and campus community.",
    department: "Information Technology",
    date: "2026-11-04",
    time: "1:00 PM - 4:00 PM",
    venue: "CCEd Lecture Hall",
    organizer: "Demo Organizer",
    capacity: 120,
  },
  {
    id: 4,
    title: "Programming Contest 2026",
    description: "A friendly timed challenge for students who enjoy solving problems with code.",
    department: "Computer Science",
    date: "2026-11-18",
    time: "9:00 AM - 12:00 PM",
    venue: "Computer Laboratory 2",
    organizer: "Demo Organizer",
    capacity: 80,
  },
];

export const departments = ["All departments", "Information Technology", "Computer Science"];
