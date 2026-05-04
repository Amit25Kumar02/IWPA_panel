export function generateMembershipId(existingIds: string[], dateOfEnrolment?: string, srNo?: number): string {
  const year = dateOfEnrolment ? new Date(dateOfEnrolment).getFullYear() : new Date().getFullYear();
  const prefix = `MEM-${year}-`;
  if (srNo != null) {
    return `${prefix}${String(srNo).padStart(3, "0")}`;
  }
  const max = existingIds
    .filter((id) => id?.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export function generateDocumentNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `DOC-${year}-`;
  const max = existingNumbers
    .filter((n) => n?.startsWith(prefix))
    .map((n) => parseInt(n.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}
