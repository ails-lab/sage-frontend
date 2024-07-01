export const extractPrefixAndEndingFromUri = (property: string) => {
  let { prefix, ending } = extractPrefixAndEndingBasedOnSymbol(property, "#");
  if (!ending) {
    ({ prefix, ending } = extractPrefixAndEndingBasedOnSymbol(property, "/"));
  }

  return { prefix, ending };
};

export const extractPrefixFromUri = (uri: string) => {
  const { prefix } = extractPrefixAndEndingFromUri(uri);
  return prefix;
};

export const extractEndingFromUri = (uri: string) => {
  const { ending } = extractPrefixAndEndingFromUri(uri);
  return ending;
};

const extractPrefixAndEndingBasedOnSymbol = (
  property: string,
  symbol = "/"
) => {
  const lastIndex = property.lastIndexOf(symbol);

  if (lastIndex !== -1) {
    const prefix = property.substring(0, lastIndex + 1);
    const ending = property.substring(lastIndex + 1);

    return { prefix, ending };
  } else {
    return { prefix: property, ending: "" };
  }
};
