import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const ImageUploader = ({ productId, onUploadComplete }) => {
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
    <div className="border border-white/60 bg-white/75 p-4 sm:p-6 font-helvetica text-text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm transition hover:border-luxury-gold/40">
      <h3 className="text-sm sm:text-base font-semibold uppercase tracking-[0.25em] text-text-dark">Upload Product Images</h3>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="mt-4 w-full border border-white/60 bg-white/70 px-3 sm:px-4 py-2 sm:py-3 text-sm text-text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition focus:border-luxury-gold/60 focus:outline-none focus:ring-1 focus:ring-luxury-gold/40 file:mr-4 file:cursor-pointer file:border-0 file:bg-text-dark file:px-5 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.25em] file:text-white hover:file:bg-black"
      />

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3 sm:space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-text-dark/70">Selected Files:</h4>
          {selectedFiles.map((file) => (
            <div
              key={file.name}
              className="flex flex-col gap-2 border border-white/60 bg-white/80 px-3 py-3 text-xs sm:text-sm text-text-dark shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="truncate" title={file.name}>
                {file.name}
              </span>
              <div className="flex items-center gap-3 sm:min-w-[140px]">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-text-light/20">
                  <span
                    className="block h-full bg-text-dark transition-all duration-300"
                    style={{ width: `${progress[file.name] || 0}%` }}
                  />
                </div>
                <span className="min-w-[32px] text-right font-semibold">
                  {progress[file.name] || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="mt-6 w-full border border-black bg-black px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:-translate-y-0.5 hover:bg-neutral-900 hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold/40 disabled:translate-y-0 disabled:border-text-light/40 disabled:bg-text-light/20 disabled:text-text-dark/50 disabled:shadow-none"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>

      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-text-dark/70">Uploaded Images:</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {uploadedImages.map((img, index) => (
              <div
                key={index}
                className="flex flex-col border border-white/60 bg-white/80 shadow-sm transition hover:border-luxury-gold/40 hover:shadow-md"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-24 w-full object-cover sm:h-28"
                />
                <div className="border-t border-white/60 bg-white/70 px-2 py-1.5">
                  <p className="truncate text-[11px] text-text-dark sm:text-xs" title={img.name}>
                    {img.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
