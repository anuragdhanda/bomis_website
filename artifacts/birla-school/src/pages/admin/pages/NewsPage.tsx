import AdminLayout from "../AdminLayout";
import NewsAdmin from "../views/NewsAdmin";

export default function NewsPage() {
  return (
    <AdminLayout title="News & Events">
      <NewsAdmin />
    </AdminLayout>
  );
}
