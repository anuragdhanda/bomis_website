import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Route, Switch, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
// Placeholders for other pages
import About from "@/pages/About";
import Academics from "@/pages/Academics";
import Admissions from "@/pages/Admissions";
import Faculty from "@/pages/Faculty";
import Gallery from "@/pages/Gallery";
import NewsEvents from "@/pages/NewsEvents";
import NewsEventDetail from "@/pages/NewsEventDetail";
import Facilities from "@/pages/Facilities";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import StudentPortal from "@/pages/StudentPortal";

function Router() {
  return (
    <Switch>
      {/* Admin Routes - rendered without PublicLayout */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:page*" component={AdminDashboard} />

      {/* Public Routes - rendered with PublicLayout */}
      <Route path="/">
        <PublicLayout>
          <Home />
        </PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout>
          <About />
        </PublicLayout>
      </Route>
      <Route path="/academics">
        <PublicLayout>
          <Academics />
        </PublicLayout>
      </Route>
      <Route path="/admissions">
        <PublicLayout>
          <Admissions />
        </PublicLayout>
      </Route>
      <Route path="/faculty">
        <PublicLayout>
          <Faculty />
        </PublicLayout>
      </Route>
      <Route path="/gallery">
        <PublicLayout>
          <Gallery />
        </PublicLayout>
      </Route>
      <Route path="/news-events">
        <PublicLayout>
          <NewsEvents />
        </PublicLayout>
      </Route>
      <Route path="/news-events/:id">
        <PublicLayout>
          <NewsEventDetail />
        </PublicLayout>
      </Route>
      <Route path="/facilities">
        <PublicLayout>
          <Facilities />
        </PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout>
          <Contact />
        </PublicLayout>
      </Route>
      <Route path="/student-portal">
        <StudentPortal />
      </Route>
      <Route>
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </>
  );
}
