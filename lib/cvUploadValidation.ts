// Browser-supplied MIME is only a consistency check. Size, generated filenames,
// private storage and file signatures remain independent checks; none is an AV scan.
const GENERIC_MIME_TYPES = new Set(["", "application/octet-stream", "binary/octet-stream"]);
const CV_MIME_TYPES: Record<string, ReadonlySet<string>> = {
  ".pdf": new Set(["application/pdf", "application/x-pdf"]),
  ".doc": new Set(["application/msword", "application/vnd.ms-word", "application/doc", "application/x-ole-storage", "application/cdfv2"]),
  ".docx": new Set(["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/x-zip-compressed"]),
};

export function isCvMimeCompatible(extension: string, declaredType: string): boolean {
  if (!Object.hasOwn(CV_MIME_TYPES, extension)) return false;
  const permitted = CV_MIME_TYPES[extension];
  if (!permitted) return false;
  const mime = declaredType.trim().toLowerCase();
  return GENERIC_MIME_TYPES.has(mime) || permitted.has(mime);
}
