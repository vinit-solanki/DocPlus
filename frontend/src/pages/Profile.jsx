import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets_frontend/assets";
import { useUser } from "@clerk/clerk-react";

function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState({
    name: "User",
    image: assets.profile_image,
    email: "No Email Provided",
    phone: "No Phone Number Provided",
    address: "No Address Provided",
    gender: "",
    dob: "Not Provided",
    bloodGroup: "Not Provided",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const metadata = user.publicMetadata || {};
      
      setUserData({
        name: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
        image: user.imageUrl || assets.profile_image,
        email: user.primaryEmailAddress?.emailAddress || "No Email Provided",
        phone: metadata.phone || "No Phone Number Provided",
        address: metadata.address || "No Address Provided",
        gender: metadata.gender || "",
        dob: metadata.dob || "Not Provided",
        bloodGroup: metadata.bloodGroup || "Not Provided",
      });
    }
  }, [user, isLoaded, isSignedIn]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        setUserData((prev) => ({
          ...prev,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          gender: userData.gender,
          dob: userData.dob,
          bloodGroup: userData.bloodGroup
        }));
        setIsEdit(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Please sign in to view profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Profile Header */}
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
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
            )}
            <p className="text-gray-600">{userData.email}</p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            {isEdit ? (
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            {isEdit ? (
              <input
                type="text"
                value={userData.address}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.address}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            {isEdit ? (
              <select
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="border rounded-md px-3 py-2 w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-800 capitalize">{userData.gender || "Not Specified"}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            {isEdit ? (
              <input
                type="date"
                value={userData.dob}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.dob}</p>
            )}
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            {isEdit ? (
              <select
                value={userData.bloodGroup}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, bloodGroup: e.target.value }))
                }
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
              <p className="text-gray-800">{userData.bloodGroup}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-2">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-sm">{successMessage}</p>
          )}
          <div className="flex justify-end">
            {isEdit ? (
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {isLoading ? 'Saving...' : 'Save Details'}
              </button>
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
    </div>
  );
}

export default Profile;