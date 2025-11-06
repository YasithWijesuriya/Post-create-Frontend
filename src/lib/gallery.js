const BASE_URL = import.meta.env.VITE_API_URL

export const putGalleryImage = async ({ file }) => {
  try {
    const endpoint = `${BASE_URL}/api/gallery/images`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server response:", errorText);
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log("Server response:", data);

    if (!data.url || !data.publicUrl) {
      throw new Error("Invalid server response format");
    }

    const { url, publicUrl } = data;

    const upload = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!upload.ok) {
      throw new Error(`Upload failed with status: ${upload.status}`);
    }

    return publicUrl.startsWith("http")
      ? publicUrl
      : `${BASE_URL}${publicUrl.startsWith("/") ? "" : "/"}${publicUrl}`;
  } catch (error) {
    console.error("Detailed upload error:", error);
    throw new Error(`Gallery image upload failed: ${error.message}`);
  }
};
