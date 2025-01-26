import React, { useState, useEffect } from "react";

const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    socialHandle: "",
    images: [],
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(""); // Added error state
  const [loading, setLoading] = useState(false); // Added loading state
  const [previewUrls, setPreviewUrls] = useState([]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file size and type
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError(
        "Some files were rejected. Please ensure all files are images under 5MB."
      );
      return;
    }

    // Cleanup old preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setFormData((prev) => ({
      ...prev,
      images: validFiles,
    }));
    const urls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setError(""); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("Submit button clicked");

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.socialHandle.trim()) {
        throw new Error("Name and social handle are required");
      }

      if (formData.images.length === 0) {
        throw new Error("Please select at least one image");
      }

      const form = new FormData();
      form.append("name", formData.name.trim());
      form.append("socialHandle", formData.socialHandle.trim());
      formData.images.forEach((image) => {
        form.append("images", image);
      });

      const response = await fetch(
        "https://social-media-fs.onrender.com/api/submit",
        {
          method: "POST",
          body: form,
          credentials: "include", // Add this for CORS
        }
      );

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        setSuccess(true);
        setError("");
        // Reset form
        setFormData({ name: "", socialHandle: "", images: [] });
        setPreviewUrls([]);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSuccess(false);
      setError(error.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear success message after delay
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [success]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Submit Your Information
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Handle
            </label>
            <input
              type="text"
              value={formData.socialHandle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialHandle: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Max 5MB each)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {previewUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
            Submission successful!
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionForm;
