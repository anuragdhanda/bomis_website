import AdminLayout from "./AdminLayout";
import DashboardHome from "./views/DashboardHome";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Overview">
      <DashboardHome />
    </AdminLayout>
  );
}
