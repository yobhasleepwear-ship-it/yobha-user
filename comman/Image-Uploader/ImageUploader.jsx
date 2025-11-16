import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const ImageUploader = ({ productId, onUploadComplete, hideUploadedDisplay = false }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [progress, setProgress] = useState({}); // track progress per file

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!productId) {
      alert("Product ID missing!");
      return;
    }

    setUploading(true);
    try {
      const results = [];

      for (let file of selectedFiles) {
        const fileName = `${productId}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `buyback/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Wait for each file upload to finish
        const url = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const prog = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProgress((prev) => ({ ...prev, [file.name]: prog }));
            },
            (err) => reject(err),
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then(resolve);
            }
          );
        });

        results.push({ name: file.name, url });
      }

      setUploadedImages([...uploadedImages, ...results]);
      setSelectedFiles([]);

      if (onUploadComplete) onUploadComplete(results);
      alert("Images uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:text-xs file:font-light file:border file:border-gray-300 file:bg-white file:text-black file:cursor-pointer hover:file:border-black file:transition-colors"
      />

      {selectedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between text-xs text-gray-600 py-1"
            >
              <span className="truncate flex-1" title={file.name}>
                {file.name}
              </span>
              <span className="ml-2 text-gray-500">
                {progress[file.name] || 0}%
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="mt-3 px-4 py-1.5 text-xs text-white bg-black border border-black hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed font-light"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {!hideUploadedDisplay && uploadedImages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2 font-light">Uploaded:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {uploadedImages.map((img, index) => (
              <div
                key={index}
                className="relative border border-gray-200 overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-20 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
