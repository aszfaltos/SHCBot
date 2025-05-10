'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if the token is stored (e.g., from a successful login)
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    
    if (token) {
      setLoggedIn(true);
      
      // If we have user data, show the username
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUsername(userData.username || userData.email || 'User');
        } catch (e) {
          console.error('Error parsing user data', e);
        }
      }
    } else {
      setLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedIn(false);
    // Redirect to login page
    router.push('/auth');
  };

  return (
    <div className="flex justify-between items-center mb-4 p-3 bg-gray-800 rounded-lg">
      {loggedIn ? (
        <>
          <p className="text-green-500">
            Logged in as <span className="font-bold">{username}</span>
          </p>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <p className="text-red-500">You are not logged in.</p>
          <button 
            onClick={() => router.push('/auth')}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </>
      )}
    </div>
  );
}