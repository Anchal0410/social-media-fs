import React, { useState, useEffect } from 'react';
import './App.css'
// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('submission');
  const handleLogout = () => {
    // Clear the admin token
    localStorage.removeItem('adminToken');
    // Reset login state
    setIsLoggedIn(false);
    // Redirect to submission page
    setCurrentPage('submission');
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto mb-8 flex justify-end space-x-4">
        <button
          onClick={() => setCurrentPage('submission')}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'submission'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Submit Form
        </button>
        <button
          onClick={() => setCurrentPage('admin')}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'admin'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Admin Dashboard
        </button>
      </nav>

      {/* Main Content */}
      {currentPage === 'submission' ? (
        <SubmissionForm />
      ) : (
        isLoggedIn ? (
          <AdminDashboard onLogout={() => {
            setIsLoggedIn(false);
            setCurrentPage('submission');
          }} />
        ) : (
          <AdminLogin onLogin={() => setIsLoggedIn(true)} />
        )
      )}
    </div>
  );
};

// Submission Form Component
const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    socialHandle: '',
    images: []
  });
  const [success, setSuccess] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Changed this function to handle the event
  const handleSubmit = async (e) => {
    e.preventDefault(); // Add this line to prevent default form submission
    console.log('Submit button clicked');
    
    const form = new FormData();
    form.append('name', formData.name);
    form.append('socialHandle', formData.socialHandle);
    formData.images.forEach((image) => {
      form.append('images', image);
    });
    
    console.log("Form Data being sent:", {
      name: formData.name,
      socialHandle: formData.socialHandle,
      imageCount: formData.images.length
    });

    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      console.log("Response received:", data);
      
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', socialHandle: '', images: [] });
        setPreviewUrls([]);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSuccess(false);
    }
  };
  useEffect(() => {
    let timer;
    if (success === false) {
      timer = setTimeout(() => {
        setSuccess(null); // Reset to null instead of true/false
      }, 3000); // 3 seconds
    }
    
    // Cleanup timer
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [success]);
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit Your Information</h2>
        {/* Changed onSubmit to pass the event */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
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
              onChange={(e) => setFormData(prev => ({...prev, socialHandle: e.target.value}))}
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







// Admin Login Component
// const AdminLogin = ({ onLogin }) => {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);


//   const handleLogin = async (e) => {
//     console.log('Default prevented');
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/api/admin/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         localStorage.setItem('adminToken', data.token);
//         onLogin();
//       } else {
//         setError('Invalid credentials');
//       }
//     } catch (error) {
//       setError('Login failed. Please try again.');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
//         <form onSubmit={handleLogin} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Username
//             </label>
//             <input
//               type="text"
//               value={credentials.username}
//               onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               value={credentials.password}
//               onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Login
//           </button>
//         </form>

//         {error && (
//           <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
//             {error}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', credentials);
      
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        console.log('Login successful');
        localStorage.setItem('adminToken', data.token);
        onLogin();
      } else {
        console.log('Login failed:', data);
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          > 
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Default credentials:
          <br />
          Username: admin
          <br />
          Password: admin123
        </div>
      </div>
    </div>
  );
};
// Admin Dashboard Component

const AdminDashboard = ({onLogout}) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/submissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      console.log('Fetched submissions:', data);
      setSubmissions(data);
      setError('');
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/submissions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.ok) {
          // Refresh submissions after delete
          fetchSubmissions();
        } else {
          throw new Error('Failed to delete submission');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete submission');
      }
    }
  };
  const handleLogout = () => {
    // Clear the admin token
    localStorage.removeItem('adminToken');
    // Call the onLogout prop
    onLogout();
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
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
          No submissions yet.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="flex space-x-4"> {/* Added container for buttons */}
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={handleLogout}
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
            <div key={submission._id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Images */}
                {submission.images && submission.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {submission.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="relative group">
                        <img
                          src={`http://localhost:5000/${img}`}
                          alt={`${submission.name}'s image ${imgIdx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg">
                          <a
                            href={`http://localhost:5000/${img}`}
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

  // return (
  //   <div className="max-w-7xl mx-auto">
  //     <div className="flex justify-between items-center mb-6">
  //       <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
  //       <button
  //         onClick={fetchSubmissions}
  //         className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
  //       >
  //         Refresh Data
  //       </button>
  //       <button
  //           onClick={onLogout}
  //           className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
  //         >
  //           Logout
  //         </button>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //       {submissions.map((submission) => (
  //         <div key={submission._id} className="bg-white rounded-lg shadow-md overflow-hidden">
  //           <div className="p-6">
  //             {/* User Info */}
  //             <div className="flex items-center space-x-4 mb-4">
  //               <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
  //                 {submission.name[0].toUpperCase()}
  //               </div>
  //               <div className="flex-1">
  //                 <h3 className="text-lg font-semibold text-gray-800">
  //                   {submission.name}
  //                 </h3>
  //                 <p className="text-gray-600">{submission.socialHandle}</p>
  //                 <p className="text-sm text-gray-500">
  //                   Submitted: {new Date(submission.createdAt).toLocaleDateString()}
  //                 </p>
  //               </div>
  //             </div>

  //             {/* Images */}
  //             {submission.images && submission.images.length > 0 ? (
  //               <div className="grid grid-cols-2 gap-2 mb-4">
  //                 {submission.images.map((img, imgIdx) => (
  //                   <div key={imgIdx} className="relative group">
  //                     <img
  //                       src={`http://localhost:5000/${img}`}
  //                       alt={`${submission.name}'s image ${imgIdx + 1}`}
  //                       className="w-full h-32 object-cover rounded-lg"
  //                       onError={(e) => {
  //                         e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
  //                       }}
  //                     />
  //                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg">
  //                       <a
  //                         href={`http://localhost:5000/${img}`}
  //                         target="_blank"
  //                         rel="noopener noreferrer"
  //                         className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"
  //                       >
  //                         View Full
  //                       </a>
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             ) : (
  //               <div className="text-center py-4 text-gray-500">
  //                 No images uploaded
  //               </div>
  //             )}

  //             {/* Actions */}
  //             <button
  //               onClick={() => handleDelete(submission._id)}
  //               className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
  //             >
  //               Delete Submission
  //             </button>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
};
export default App;