export const camelcaseString = (str: string, separator = " "): string => {
  const words = str.toLowerCase().split(separator);
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
  }
  return words.join(" ");
};
