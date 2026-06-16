export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadToCloudinary(base64Image: string): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary not configured");
  }

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append(
    "upload_preset",
    process.env.CLOUDINARY_UPLOAD_PRESET || "vastra_uploads"
  );
  formData.append("api_key", process.env.CLOUDINARY_API_KEY!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}
