import { JsonLd } from "./JsonLd";
import { SITE_URL } from "./Seo";

interface Crumb {
  label: string;
  path: string;
}

export function SeoBreadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs = [{ label: "Home", path: "/" }, ...items];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
  return <JsonLd data={data} />;
}