import React, { useState, useEffect } from "react";

const AdminDashboard = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);
  const API_URL = "https://social-media-fs.onrender.com";
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/submissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      console.log("Fetched submissions:", data);
      setSubmissions(data);
      setError("");
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load submissions");
      if (error.message.includes("token")) {
        // If token is invalid, logout
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        const response = await fetch(`${API_URL}/api/submissions/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        if (response.ok) {
          // Update state directly instead of refetching
          setSubmissions((prev) => prev.filter((sub) => sub._id !== id));
        } else {
          throw new Error("Failed to delete submission");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete submission");
      }
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/150?text=Image+Error";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="flex space-x-4">
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
          No submissions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {submission.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {submission.name}
                    </h3>
                    <p className="text-gray-600">{submission.socialHandle}</p>
                    <p className="text-sm text-gray-500">
                      Submitted:{" "}
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Images */}
                {submission.images && submission.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {submission.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="relative group">
                        <img
                          src={`${API_URL}/${img}`}
                          alt={`${submission.name}'s image ${imgIdx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg">
                          <a
                            href={`${API_URL}/${img}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"
                          >
                            View Full
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No images uploaded
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => handleDelete(submission._id)}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Submission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
