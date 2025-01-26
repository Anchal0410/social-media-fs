// Submission.js
import React, { useState, useEffect } from "react";

const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    socialHandle: "",
    images: [],
  });
  const [success, setSuccess] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("socialHandle", formData.socialHandle);
    formData.images.forEach((image) => {
      form.append("images", image);
    });

    try {
      const response = await fetch(
        "https://social-media-fs.onrender.com/api/submit",
        {
          method: "POST",
          body: form,
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", socialHandle: "", images: [] });
        setPreviewUrls([]);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSuccess(false);
    }
  };

  useEffect(() => {
    let timer;
    if (success === false) {
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
            Submission successful!
          </div>
        )}

        {success === false && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
            Submission failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionForm;
