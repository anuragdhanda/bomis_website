import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Chatbot } from "@/components/Chatbot";
import { AdmissionDrawerProvider } from "@/context/AdmissionDrawerContext";
import { AdmissionDrawer } from "@/components/AdmissionDrawer";
import { Route, Switch, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import About from "@/pages/About";
import Academics from "@/pages/Academics";
import Admissions from "@/pages/Admissions";
import Faculty from "@/pages/Faculty";
import Gallery from "@/pages/Gallery";
import Facilities from "@/pages/Facilities";
import Contact from "@/pages/Contact";
import StudentPortal from "@/pages/StudentPortal";
import Legal from "@/pages/Legal";

// Admin
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import GalleryPage from "@/pages/admin/pages/GalleryPage";
import FacultyPage from "@/pages/admin/pages/FacultyPage";
import InquiriesPage from "@/pages/admin/pages/InquiriesPage";

function Router() {
  return (
    <Switch>
      {/* ── Admin Routes (no PublicLayout) ───────────────────── */}
      <Route path="/admin/login"     component={AdminLogin} />
      <Route path="/admin/gallery"   component={GalleryPage} />
      <Route path="/admin/faculty"   component={FacultyPage} />
      <Route path="/admin/inquiries" component={InquiriesPage} />
      <Route path="/admin"           component={AdminDashboard} />

      {/* ── Public Routes ────────────────────────────────────── */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/academics">
        <PublicLayout><Academics /></PublicLayout>
      </Route>
      <Route path="/admissions">
        <PublicLayout><Admissions /></PublicLayout>
      </Route>
      <Route path="/faculty">
        <PublicLayout><Faculty /></PublicLayout>
      </Route>
      <Route path="/gallery">
        <PublicLayout><Gallery /></PublicLayout>
      </Route>
      <Route path="/facilities">
        <PublicLayout><Facilities /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/student-portal">
        <StudentPortal />
      </Route>
      <Route path="/privacy-policy">
        <PublicLayout><Legal kind="privacy" /></PublicLayout>
      </Route>
      <Route path="/terms-of-service">
        <PublicLayout><Legal kind="terms" /></PublicLayout>
      </Route>
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AdmissionDrawerProvider>
      <ScrollToTop />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <AdmissionDrawer />
      <Chatbot />
    </AdmissionDrawerProvider>
  );
}
