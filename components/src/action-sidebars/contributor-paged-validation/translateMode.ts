/**
 * Converts a mode string to form values.
 *
 * @param mode - The mode string to convert, ex. PAV-SCR:AVG:ASC-VAL:CNT:ASC.
 * @returns An object representing the form values, ex. {SCR:AVG: 'ASC', VAL:CNT: 'ASC'}.
 */
export const modeToFormValues = (mode: string) => {
  const modeSplitted = mode.split("-");
  if (modeSplitted.length <= 1) {
    return {};
  }
  const sortingOrder = modeSplitted.slice(1);

  const itemSortingOrder: { [key: string]: "ASC" | "DESC" } = {};
  sortingOrder.forEach((sort) => {
    const sortSplitted = sort.split(":");

    // Initialize two variables to hold the combined elements and the last element
    let combinedElements = "";
    let lastElement = "";

    // Loop over each element in the array
    for (let i = 0; i < sortSplitted.length; i++) {
      // If we're at the last element, save it to `lastElement`
      if (i === sortSplitted.length - 1) {
        lastElement = sortSplitted[i];
      } else {
        // Otherwise, add the current element to `combinedElements`, followed by a colon
        combinedElements += sortSplitted[i] + ":";
      }
    }

    // Remove the trailing colon from `combinedElements`
    combinedElements = combinedElements.slice(0, -1);

    // Now `combinedElements` is a string of all elements except the last, joined by colons,
    // and `lastElement` is the last element
    itemSortingOrder[combinedElements] = lastElement as "ASC" | "DESC";
  });
  return itemSortingOrder;
};

export const modeToStrategy = (mode: string) => {
  const modeSplitted = mode.split("-");
  if (modeSplitted.length <= 1) {
    return "";
  }
  const sortingOrder = modeSplitted.slice(1);

  const itemSortingStrategy = [modeSplitted[0]];
  sortingOrder.forEach((sort) => {
    const sortSplitted = sort.split(":");

    // Initialize two variables to hold the combined elements and the last element
    let combinedElements = "";

    // Loop over each element in the array
    for (let i = 0; i < sortSplitted.length; i++) {
      // If we're at the last element, break
      if (i === sortSplitted.length - 1) {
        break;
      } else {
        // Otherwise, add the current element to `combinedElements`, followed by a colon
        combinedElements += sortSplitted[i] + ":";
      }
    }

    // Remove the trailing colon from `combinedElements`
    combinedElements = combinedElements.slice(0, -1);

    // Now `combinedElements` is a string of all elements except the last, joined by colons,
    // and `lastElement` is the last element
    itemSortingStrategy.push(combinedElements);
  });
  return itemSortingStrategy.join("-");
};

/**
 * Converts form values to a mode string.
 *
 * @param itemSortingOrder - An object representing the form values, ex. {SCR:AVG: 'ASC', VAL:CNT: 'ASC'}.
 * @returns The mode string, ex. PAV-SCR:AVG:ASC-VAL:CNT:ASC.
 */
export const formValuesToMode = (itemSortingOrder: {
  [key: string]: "ASC" | "DESC";
}) =>
  "PAV-" +
  Object.entries(itemSortingOrder)
    .map(([key, value]) => key + ":" + value)
    .join("-");
