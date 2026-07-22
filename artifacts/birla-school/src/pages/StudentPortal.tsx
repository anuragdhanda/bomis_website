import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, User, Calendar, Bell, LogOut, TrendingUp,
  Award, Clock, CheckCircle, XCircle, AlertCircle,
  GraduationCap, FileText, Star, ChevronRight
} from "lucide-react";

// ── Mock student data ──────────────────────────────────────────────────────────
const MOCK_STUDENT = {
  name: "Aryan Sharma",
  rollNo: "BOMIS2024089",
  class: "10-A",
  section: "Science",
  photo: null,
  attendance: 92,
};

const GRADES = [
  { subject: "Mathematics",   marks: 94, total: 100, grade: "A+", color: "#F15A29" },
  { subject: "Physics",       marks: 88, total: 100, grade: "A",  color: "#8B1E2D" },
  { subject: "Chemistry",     marks: 91, total: 100, grade: "A+", color: "#F15A29" },
  { subject: "English",       marks: 85, total: 100, grade: "A",  color: "#8B1E2D" },
  { subject: "Hindi",         marks: 79, total: 100, grade: "B+", color: "#555"    },
  { subject: "Computer Sci.", marks: 97, total: 100, grade: "A+", color: "#F15A29" },
];

const TIMETABLE: Record<string, { time: string; subject: string; teacher: string }[]> = {
  Monday:    [
    { time: "8:00 – 8:45",  subject: "Mathematics",   teacher: "Mr. Verma"   },
    { time: "8:45 – 9:30",  subject: "Physics",        teacher: "Ms. Gupta"   },
    { time: "9:45 – 10:30", subject: "Chemistry",      teacher: "Mr. Singh"   },
    { time: "10:30 – 11:15",subject: "English",         teacher: "Ms. Sharma"  },
    { time: "11:30 – 12:15",subject: "Computer Sci.",  teacher: "Mr. Raj"     },
  ],
  Tuesday:   [
    { time: "8:00 – 8:45",  subject: "Hindi",          teacher: "Ms. Rani"    },
    { time: "8:45 – 9:30",  subject: "Mathematics",    teacher: "Mr. Verma"   },
    { time: "9:45 – 10:30", subject: "English",         teacher: "Ms. Sharma"  },
    { time: "10:30 – 11:15",subject: "Physics",         teacher: "Ms. Gupta"   },
    { time: "11:30 – 12:15",subject: "Chemistry",       teacher: "Mr. Singh"   },
  ],
  Wednesday: [
    { time: "8:00 – 8:45",  subject: "Computer Sci.", teacher: "Mr. Raj"     },
    { time: "8:45 – 9:30",  subject: "Chemistry",      teacher: "Mr. Singh"   },
    { time: "9:45 – 10:30", subject: "Mathematics",    teacher: "Mr. Verma"   },
    { time: "10:30 – 11:15",subject: "Hindi",           teacher: "Ms. Rani"    },
    { time: "11:30 – 12:15",subject: "English",         teacher: "Ms. Sharma"  },
  ],
  Thursday:  [
    { time: "8:00 – 8:45",  subject: "Physics",        teacher: "Ms. Gupta"   },
    { time: "8:45 – 9:30",  subject: "Computer Sci.", teacher: "Mr. Raj"     },
    { time: "9:45 – 10:30", subject: "Hindi",           teacher: "Ms. Rani"    },
    { time: "10:30 – 11:15",subject: "Chemistry",       teacher: "Mr. Singh"   },
    { time: "11:30 – 12:15",subject: "Mathematics",     teacher: "Mr. Verma"   },
  ],
  Friday:    [
    { time: "8:00 – 8:45",  subject: "English",        teacher: "Ms. Sharma"  },
    { time: "8:45 – 9:30",  subject: "Hindi",           teacher: "Ms. Rani"    },
    { time: "9:45 – 10:30", subject: "Physics",         teacher: "Ms. Gupta"   },
    { time: "10:30 – 11:15",subject: "Mathematics",     teacher: "Mr. Verma"   },
    { time: "11:30 – 12:15",subject: "Computer Sci.",  teacher: "Mr. Raj"     },
  ],
};

const NOTICES = [
  { id: 1, title: "Annual Sports Day – 5 August", type: "event",   date: "22 Jul 2025", icon: Award      },
  { id: 2, title: "Half-Yearly Exam Schedule Released", type: "exam", date: "20 Jul 2025", icon: FileText  },
  { id: 3, title: "Parent-Teacher Meeting – 28 July", type: "meet", date: "18 Jul 2025", icon: User       },
  { id: 4, title: "Fee Submission Last Date: 31 July", type: "fee",  date: "15 Jul 2025", icon: AlertCircle},
  { id: 5, title: "Science Exhibition Registrations Open", type: "event", date: "12 Jul 2025", icon: Star  },
];

const ATTENDANCE_MONTHS = [
  { month: "Jan", present: 22, total: 24 },
  { month: "Feb", present: 19, total: 20 },
  { month: "Mar", present: 23, total: 25 },
  { month: "Apr", present: 20, total: 22 },
  { month: "May", present: 17, total: 18 },
  { month: "Jun", present: 21, total: 23 },
];

const TABS = ["Dashboard", "Grades", "Attendance", "Timetable", "Notices"];
const DAYS  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// ── Variants ───────────────────────────────────────────────────────────────────
const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [roll, setRoll]       = useState("");
  const [pass, setPass]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roll || !pass) { setError("Sabhi fields bharna zaroori hai."); return; }
    setLoading(true);
    setTimeout(() => {
      if (roll === "BOMIS2024089" && pass === "student123") {
        onLogin();
      } else {
        setError("Roll No. ya password galat hai. Hint: BOMIS2024089 / student123");
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4">
      {/* Floating blobs */}
      <motion.div className="absolute w-72 h-72 rounded-full bg-[#F15A29]/20 blur-3xl top-10 left-10"
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }} />
      <motion.div className="absolute w-56 h-56 rounded-full bg-[#8B1E2D]/20 blur-3xl bottom-10 right-10"
        animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }} transition={{ duration: 9, repeat: Infinity }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F15A29] mb-4 shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Student Portal</h1>
          <p className="text-white/60 text-sm mt-1">Birla Open Minds International School</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1.5">Roll Number</label>
            <input
              type="text" value={roll} onChange={e => { setRoll(e.target.value); setError(""); }}
              placeholder="e.g. BOMIS2024089"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#F15A29] focus:bg-white/15 transition"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1.5">Password</label>
            <input
              type="password" value={pass} onChange={e => { setPass(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#F15A29] focus:bg-white/15 transition"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-[#F15A29] text-white font-semibold text-base shadow-lg hover:bg-[#d94e22] transition disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? (
              <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            ) : "Login"}
          </motion.button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          Demo: Roll No. <span className="text-white/70">BOMIS2024089</span> / Pass: <span className="text-white/70">student123</span>
        </p>
      </motion.div>
    </div>
  );
}

// ── Dashboard Tab ──────────────────────────────────────────────────────────────
function DashboardTab() {
  const avg = Math.round(GRADES.reduce((s, g) => s + g.marks, 0) / GRADES.length);
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Class Average",    value: `${avg}%`,  icon: TrendingUp, color: "#F15A29" },
          { label: "Attendance",       value: "92%",      icon: CheckCircle,color: "#22c55e" },
          { label: "Top Subject",      value: "Comp Sci", icon: Star,        color: "#8B1E2D" },
          { label: "Rank",             value: "#4",       icon: Award,       color: "#eab308" },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + "20" }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick grades */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#F15A29]" /> Recent Performance
        </h3>
        <div className="space-y-3">
          {GRADES.map((g, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32 shrink-0">{g.subject}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: g.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${g.marks}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 w-10 text-right">{g.marks}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: g.color + "20", color: g.color }}>{g.grade}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Today's schedule */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F15A29]" /> Today's Classes
        </h3>
        <div className="space-y-2">
          {TIMETABLE.Monday.map((cls, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition">
              <span className="text-xs text-gray-400 w-28 shrink-0">{cls.time}</span>
              <span className="text-sm font-medium text-gray-700">{cls.subject}</span>
              <span className="ml-auto text-xs text-gray-400">{cls.teacher}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Grades Tab ─────────────────────────────────────────────────────────────────
function GradesTab() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {GRADES.map((g, i) => (
        <motion.div key={i} variants={fadeUp}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ background: g.color }}>
              {g.grade}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{g.subject}</p>
              <p className="text-sm text-gray-400 mt-0.5">{g.marks} / {g.total} marks</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: g.color }}
                  initial={{ width: 0 }} animate={{ width: `${g.marks}%` }}
                  transition={{ delay: i * 0.1, duration: 0.7 }} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold" style={{ color: g.color }}>{g.marks}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Percentage</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Attendance Tab ─────────────────────────────────────────────────────────────
function AttendanceTab() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Circle */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        <svg width="140" height="140" className="rotate-[-90deg]">
          <circle cx="70" cy="70" r="58" fill="none" stroke="#f3f4f6" strokeWidth="12" />
          <motion.circle cx="70" cy="70" r="58" fill="none" stroke="#F15A29" strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - 0.92) }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <p className="text-4xl font-bold text-[#F15A29] -mt-20">92%</p>
        <p className="text-gray-500 text-sm mt-1 mb-6">Overall Attendance</p>
        <div className="flex gap-8 text-center">
          <div><p className="text-xl font-bold text-green-500">122</p><p className="text-xs text-gray-400">Present</p></div>
          <div><p className="text-xl font-bold text-red-400">10</p><p className="text-xs text-gray-400">Absent</p></div>
          <div><p className="text-xl font-bold text-yellow-500">2</p><p className="text-xs text-gray-400">Leave</p></div>
        </div>
      </motion.div>

      {/* Monthly bars */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-5">Monthly Breakdown</h3>
        <div className="flex items-end gap-3 h-36">
          {ATTENDANCE_MONTHS.map((m, i) => {
            const pct = (m.present / m.total) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-[10px] font-semibold text-[#F15A29]">{m.present}</p>
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-end" style={{ height: "96px" }}>
                  <motion.div className="rounded-lg" style={{ background: "#F15A29" }}
                    initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                    transition={{ delay: i * 0.08, duration: 0.6 }} />
                </div>
                <p className="text-[10px] text-gray-400">{m.month}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Timetable Tab ──────────────────────────────────────────────────────────────
function TimetableTab() {
  const [activeDay, setActiveDay] = useState("Monday");
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Day tabs */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition
              ${activeDay === d ? "bg-[#F15A29] text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-[#F15A29]"}`}>
            {d}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeDay}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-3">
          {TIMETABLE[activeDay].map((cls, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-1 h-12 rounded-full bg-[#F15A29] shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{cls.subject}</p>
                <p className="text-sm text-gray-400">{cls.teacher}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">{cls.time}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ── Notices Tab ────────────────────────────────────────────────────────────────
function NoticesTab() {
  const typeColor: Record<string, string> = { event: "#F15A29", exam: "#8B1E2D", meet: "#3b82f6", fee: "#eab308" };
  const typeLabel: Record<string, string> = { event: "Event", exam: "Exam", meet: "Meeting", fee: "Fee" };
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {NOTICES.map((n, i) => (
        <motion.div key={n.id} variants={fadeUp}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition cursor-pointer">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: (typeColor[n.type] ?? "#F15A29") + "20" }}>
            <n.icon className="w-5 h-5" style={{ color: typeColor[n.type] ?? "#F15A29" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 leading-snug">{n.title}</p>
            <p className="text-xs text-gray-400 mt-1">{n.date}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-lg shrink-0"
            style={{ background: (typeColor[n.type] ?? "#F15A29") + "15", color: typeColor[n.type] ?? "#F15A29" }}>
            {typeLabel[n.type] ?? n.type}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Portal Dashboard ───────────────────────────────────────────────────────────
function PortalDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F15A29] to-[#8B1E2D] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">{MOCK_STUDENT.name}</p>
              <p className="text-white/70 text-xs">Class {MOCK_STUDENT.class} · {MOCK_STUDENT.rollNo}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-0 overflow-x-auto">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-xl transition
                  ${activeTab === t ? "bg-gray-50 text-[#F15A29]" : "text-white/70 hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}>
            {activeTab === "Dashboard"  && <DashboardTab />}
            {activeTab === "Grades"     && <GradesTab />}
            {activeTab === "Attendance" && <AttendanceTab />}
            {activeTab === "Timetable"  && <TimetableTab />}
            {activeTab === "Notices"    && <NoticesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function StudentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn
    ? <PortalDashboard onLogout={() => setLoggedIn(false)} />
    : <LoginScreen onLogin={() => setLoggedIn(true)} />;
}
