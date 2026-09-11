import { useEffect } from "react";

export const SITE_URL = "https://bomiswebsite-anurag-2773.vercel.app";
export const SITE_NAME = "Bright Open Minds, Rajound";
export const DEFAULT_TITLE = "Best CBSE School in Rajound, Haryana | Bright Open Minds";
export const DEFAULT_DESCRIPTION =
  "Bright Open Minds, Rajound — a premier school in Haryana with holistic CBSE education, expert faculty and 1,200+ happy students. Admissions open. Apply today.";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo({
  title,
  description,
  path = "/",
  image = "/og-image.png",
  noIndex = false,
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setLink("canonical", `${SITE_URL}${path}`);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", `${SITE_URL}${path}`);
    setMeta("property", "og:image", `${SITE_URL}${image}`);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta(
      "name",
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow"
    );
  }, [title, description, path, image, noIndex]);

  return null;
}