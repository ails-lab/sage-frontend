export const onPropertyExtractClass = (onProperty: any) => {
  if (Array.isArray(onProperty)) {
    const classObj = onProperty.find(
      (item: { type: string; uri: string }) =>
        item.type.toLowerCase() === "class"
    );
    return classObj.uri;
  }
  return "";
};

export const onPropertyExtractProperties = (onProperty: any) => {
  if (Array.isArray(onProperty)) {
    const propertiesUris = onProperty
      .filter(
        (item: { type: string; uri: string }) =>
          item.type.toLowerCase() === "property"
      )
      .map((prop) => prop.uri);
    return propertiesUris;
  }
  return [];
};
