/**
 * Tiện ích tải file blob về máy (dùng cho export CSV/XLSX - B2).
 */

/** Lấy tên file từ header Content-Disposition, hỗ trợ cả filename* (RFC 5987). */
export function filenameFromContentDisposition(header, fallback) {
  if (!header) return fallback;
  // filename*=UTF-8''abc.xlsx  (ưu tiên, đã encode)
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].replace(/^"|"$/g, ''));
    } catch {
      /* rơi xuống filename thường */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1] ?? fallback;
}

/** Tạo link ẩn và click để trình duyệt tải blob về với tên `filename`. */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Giải phóng URL sau khi trình duyệt kịp bắt đầu tải.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
