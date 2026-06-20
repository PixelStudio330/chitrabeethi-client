/**
 * Uploads a raw file to imgBB and returns the hosted image URL
 * @param file - The raw File object from an HTML input element
 */
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("imgBB API Key is missing from environment configuration.");
  }

  // imgBB expects data formatted as "Multipart Form Data"
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData, // Browser automatically sets content-type header for FormData
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to imgBB infrastructure.");
    }

    const result = await response.json();
    
    // This is the direct hotlink to the hosted image!
    return result.data.url; 
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};