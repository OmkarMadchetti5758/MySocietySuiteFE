const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/api\/v1\/?$/, "");

/** Turn a stored path or Spaces URL into a URL the browser can load. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("blob:")) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/uploads/")) return url;
  return url.startsWith("/") ? `${API_ORIGIN}${url}` : `${API_ORIGIN}/${url}`;
}

export function isImageAttachment(url) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return false;
  return (
    /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(resolved) ||
    resolved.includes("/uploads/") ||
    resolved.includes("digitaloceanspaces.com")
  );
}
