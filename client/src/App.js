import React, { useState } from 'react';
import './App.css';
import SubmissionForm from './components/Submission';
import Admin from './components/Admin';

const App = () => {
  const [currentPage, setCurrentPage] = useState('submission');

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
      {currentPage === 'submission' ? <SubmissionForm /> : <Admin />}
    </div>
  );
};

export default App;