import { ArrowRight, CalendarDays, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Landing() {
  return <main className="landing"><section className="hero"><div><p className="eyebrow">Event registration, made visible</p><h1>One place for every campus event.</h1><p className="hero-copy">Discover events, reserve your seat, and keep attendance moving with a simple QR-first experience.</p><div className="hero-actions"><Link className="button button-dark" to="/login">Open demo <ArrowRight size={17} /></Link><Link className="button button-outline" to="/events">Browse events</Link></div></div><div className="hero-panel"><span className="hero-kicker">TODAY'S CONTROL ROOM</span><strong>04</strong><p>upcoming events</p><div className="hero-rule" /><span>Installable PWA foundation</span></div></section><section className="feature-grid"><article><CalendarDays /><h2>Plan</h2><p>Browse and manage events with departments, seats, venues, and dates in one view.</p></article><article><QrCode /><h2>Tap in</h2><p>Give every registration a personal event pass ready for a future camera check-in.</p></article><article><ShieldCheck /><h2>Trust</h2><p>Role-based workspaces keep student, organizer, and admin tasks separate.</p></article></section></main>;
}

export default Landing;
