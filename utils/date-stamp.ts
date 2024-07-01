export const dateStamp = (isoDate?: string): string =>
  isoDate
    ? new Date(isoDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : " - ";
