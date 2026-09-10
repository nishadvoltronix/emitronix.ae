/** Apply a trusted service hint only to an untouched, empty service select. */
export function prefillContactService(
  select: Pick<HTMLSelectElement, "value" | "options"> | null,
  intents: readonly string[],
  siteVisitLabel: string,
  userEdited: boolean,
): boolean {
  if (
    !select || userEdited || select.value !== "" ||
    intents.length !== 1 || intents[0] !== "site-visit"
  ) return false;

  // Query values never become arbitrary form values: select only an existing,
  // enabled option using the form's own English or Arabic label.
  const option = Array.from(select.options).find(
    (candidate) => candidate.value === siteVisitLabel && !candidate.disabled,
  );
  if (!option) return false;

  select.value = option.value;
  return true;
}
