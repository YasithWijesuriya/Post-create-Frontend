import { Input } from "./ui/input";
import { putGalleryImage } from "../lib/gallery";
import { useState } from "react";

function GalleryImageInput({ onChange, value }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      if (!e.target.files) return;
      
      const file = e.target.files[0];
      if (!file) return;
      
      const publicUrl = await putGalleryImage({ file });
      onChange(publicUrl); 

      
      if (!publicUrl) {
        setUploadError("Gallery image upload failed!");
        return;
      }
      
      
      try {
        new URL(publicUrl); 
        onChange(publicUrl);
      } catch (urlError) {
        setUploadError("Invalid image URL received from server");
        console.error("Invalid URL:", publicUrl);
      }

    } catch (error) {
      console.error("Error uploading gallery image:", error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Input 
        type="file" 
        onChange={handleFileChange} 
        accept="image/*" 
        className="cursor-pointer"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="mt-2 text-sm text-blue-600">
          Uploading image...
        </div>
      )}
      {uploadError && (
        <div className="mt-2 text-sm text-red-600">
          {uploadError}
        </div>
      )}
      {value && !uploadError && !isUploading && (
        <div className="mt-2 text-sm text-green-600">
          ✓ Image uploaded successfully
        </div>
      )}
    </div>
  );
}

export default GalleryImageInput;