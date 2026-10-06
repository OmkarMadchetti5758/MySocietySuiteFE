/**
 * triggerDownload.js
 *
 * Programmatically triggers a file download via a hidden <a> tag.
 * This avoids popup-blocker issues that affect window.open().
 *
 * @param {string} url      - The download URL (local or S3 pre-signed)
 * @param {string} filename - Suggested filename for the download
 */
export function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  // Clean up after a short delay to allow the download to start
  setTimeout(() => document.body.removeChild(a), 200);
}
