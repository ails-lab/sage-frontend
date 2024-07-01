export const downloadFile = async (url: string, filename?: string) => {
  const token = useCookie("accessToken");
  if (!token.value) return { error: { value: "No token" } };

  try {
    let responseFilename;
    const response: Blob = await $fetch(url, {
      onResponse(context) {
        responseFilename = context.response.headers
          ?.get("content-disposition")
          ?.split(";")
          ?.find((n) => n.includes("filename="))
          ?.replace("filename=", "")
          ?.trim();
      },
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    const finalFilename = filename || responseFilename || "file";
    downloadBlob(response, finalFilename);
    return { error: {}, filename };
  } catch (error: any) {
    return { error: { value: error } };
  }
};

export const downloadBlob = (blob: Blob, filename: string) => {
  // Create a Blob URL
  const blobUrl = window.URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set the link's href attribute to the Blob URL
  link.href = blobUrl;

  // Set the link's download attribute to the desired filename
  link.download = filename;

  // Append the link to the document body
  document.body.appendChild(link);

  // Trigger a click on the link to start the download
  link.click();

  // Remove the link from the document body
  document.body.removeChild(link);

  // Release the Blob URL
  window.URL.revokeObjectURL(blobUrl);
};
