import React, { useState, useEffect } from 'react';
import { assets } from '@/assets/assets_frontend/assets';
import axios from 'axios';

function Profile() {
  const [userData, setUserData] = useState({
    name: 'User',
    image: assets.profile_image,
    email: 'No Email Provided',
    phone: 'No Phone Number Provided',
    address: 'No Address Provided',
    gender: '',
    dob: '',
    bloodGroup: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Fixed key (adjust if different)
    console.log('Token found:', token ? 'Yes' : 'No'); // Debug log
    if (token) {
      setIsAuthenticated(true);
      const fetchPatient = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`https://docplus-backend-ruby.vercel.app/api/patients`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('API Response:', response.data); // Debug log
          const data = response.data;
          setUserData({
            name: data.name || 'User',
            image: data.image || assets.profile_image,
            email: data.email || 'No Email Provided',
            phone: data.phone || 'No Phone Number Provided',
            address: data.address || 'No Address Provided',
            gender: data.gender || '',
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
            bloodGroup: data.bloodGroup || '',
          });
        } catch (err) {
          console.error('Fetch Error:', err.response || err.message); // Debug log
          if (err.response) {
            if (err.response.status === 401) {
              setError('Unauthorized. Please sign in again.');
            } else if (err.response.status === 404) {
              setError('No profile found. Please complete your profile.');
            } else {
              setError('Failed to load profile data.');
            }
          } else {
            setError('Network error. Please check your connection.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatient();
    } else {
      setError('Please sign in to view your profile.');
      setIsLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Saving profile with data:', userData);
      let response;
      try {
        response = await axios.put(
          `https://docplus-backend-ruby.vercel.app/api/patients`,
          { ...userData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        if (err.response?.status === 404) {
          // Create new patient if none exists
          response = await axios.post(
            `https://docplus-backend-ruby.vercel.app/api/patients`,
            { ...userData },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw err;
        }
      }
      console.log('Save Response:', response.data);
      setUserData({
        name: response.data.name || 'User',
        image: response.data.image || assets.profile_image,
        email: response.data.email || 'No Email Provided',
        phone: response.data.phone || 'No Phone Number Provided',
        address: response.data.address || 'No Address Provided',
        gender: response.data.gender || '',
        dob: response.data.dob ? new Date(response.data.dob).toISOString().split('T')[0] : '',
        bloodGroup: response.data.bloodGroup || '',
      });
      setIsEdit(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Save Error:', err.response || err.message);
      setError(
        err.response?.status === 401
          ? 'Unauthorized. Please sign in again.'
          : 'Failed to update profile.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-8">
          <img
            src={userData.image}
            alt={userData.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            {isEdit ? (
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
            )}
            <p className="text-gray-600">{userData.email}</p>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            {isEdit ? (
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            {isEdit ? (
              <input
                type="text"
                value={userData.address}
                onChange={(e) => setUserData((prev) => ({ ...prev, address: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.address}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            {isEdit ? (
              <select
                value={userData.gender}
                onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-800 capitalize">{userData.gender || 'Not Specified'}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            {isEdit ? (
              <input
                type="date"
                value={userData.dob}
                onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.dob || 'Not Provided'}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            {isEdit ? (
              <select
                value={userData.bloodGroup}
                onChange={(e) => setUserData((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <p className="text-gray-800">{userData.bloodGroup || 'Not Provided'}</p>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          {isEdit ? (
            <>
              <button
                onClick={() => setIsEdit(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {isLoading ? 'Saving...' : 'Save Details'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;