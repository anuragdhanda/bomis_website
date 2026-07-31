import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
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
import NewsEvents from "@/pages/NewsEvents";
import NewsEventDetail from "@/pages/NewsEventDetail";
import Facilities from "@/pages/Facilities";
import Contact from "@/pages/Contact";
import StudentPortal from "@/pages/StudentPortal";

function Router() {
  return (
    <Switch>
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
      <Route path="/news-events">
        <PublicLayout><NewsEvents /></PublicLayout>
      </Route>
      <Route path="/news-events/:id">
        <PublicLayout><NewsEventDetail /></PublicLayout>
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
    </AdmissionDrawerProvider>
  );
}
