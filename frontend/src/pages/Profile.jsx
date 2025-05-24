import { useState, useEffect } from "react"
import { assets } from "@/assets/assets_frontend/assets"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

function Profile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    bloodGroup: "",
  })
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://docplus-backend-ruby.vercel.app"

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Please sign in to view your profile.")
      setIsLoading(false)
      navigate("/login")
      return
    }

    // Validate token
    try {
      const decoded = jwtDecode(token)
      if (decoded.exp * 1000 < Date.now()) {
        setError("Session expired. Please sign in again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setIsLoading(false)
        navigate("/login")
        return
      }
      setIsAuthenticated(true)
      fetchPatientProfile(token)
    } catch (err) {
      setError("Invalid token. Please sign in again.")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setIsLoading(false)
      navigate("/login")
    }
  }, [navigate])

  const fetchPatientProfile = async (token) => {
    try {
      setIsLoading(true)
      setError(null)

      // First, try to get user data from /auth/me
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const user = userResponse.data
      let patientData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        gender: user.profile?.gender || "",
        dob: user.profile?.dob ? new Date(user.profile.dob).toISOString().split("T")[0] : "",
        bloodGroup: user.profile?.bloodGroup || "",
      }

      // If profile data is incomplete, try /patients/me
      if (!user.profile || !user.profile.phone) {
        try {
          const patientResponse = await axios.get(`${API_BASE_URL}/api/patients/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          patientData = {
            ...patientData,
            phone: patientResponse.data.phone || "",
            address: patientResponse.data.address || "",
            gender: patientResponse.data.gender || "",
            dob: patientResponse.data.dob
              ? new Date(patientResponse.data.dob).toISOString().split("T")[0]
              : "",
            bloodGroup: patientResponse.data.bloodGroup || "",
          }
        } catch (patientErr) {
          if (patientErr.response?.status === 404) {
            // No patient profile exists, use user data from localStorage as fallback
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
            patientData = {
              name: storedUser.name || user.name || "",
              email: storedUser.email || user.email || "",
              phone: "",
              address: "",
              gender: "",
              dob: "",
              bloodGroup: "",
            }
          } else {
            throw patientErr
          }
        }
      }

      setUserData(patientData)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError(
        err.response?.data?.message ||
          "Failed to load profile data. Please try again or sign in again."
      )
      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage("")

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication required. Please sign in again.")
      setIsLoading(false)
      navigate("/login")
      return
    }

    try {
      // Validate required fields
      if (!userData.name || !userData.email) {
        setError("Name and email are required")
        setIsLoading(false)
        return
      }

      // Try to create/update the patient profile
      await axios.post(`${API_BASE_URL}/api/patients`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccessMessage("Profile saved successfully!")
      setIsEdit(false)

      // Refresh the profile data
      await fetchPatientProfile(token)
    } catch (err) {
      console.error("Error saving profile:", err)
      setError(err.response?.data?.message || "Failed to save profile")
      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      }
    } finally {
      setIsLoading(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-8">
          <img
            src={assets.profile_image || "/placeholder.svg"}
            alt={userData.name || "User"}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            {isEdit ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{userData.name || "No name provided"}</h2>
            )}
            <p className="text-gray-600">{userData.email || "No email provided"}</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEdit ? (
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Email address"
              />
            ) : (
              <p className="text-gray-800">{userData.email || "Not provided"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            {isEdit ? (
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Phone number"
              />
            ) : (
              <p className="text-gray-800">{userData.phone || "Not provided"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            {isEdit ? (
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleInputChange}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Address"
              />
            ) : (
              <p className="text-gray-800">{userData.address || "Not provided"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            {isEdit ? (
              <select
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
                className="border rounded-md px-3 py-2 w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-800 capitalize">{userData.gender || "Not specified"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            {isEdit ? (
              <input
                type="date"
                name="dob"
                value={userData.dob}
                onChange={handleInputChange}
                className="border rounded-md px-3 py-2 w-full"
              />
            ) : (
              <p className="text-gray-800">{userData.dob || "Not provided"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            {isEdit ? (
              <select
                name="bloodGroup"
                value={userData.bloodGroup}
                onChange={handleInputChange}
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
              <p className="text-gray-800">{userData.bloodGroup || "Not provided"}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {isEdit ? (
            <>
              <button
                onClick={() => setIsEdit(false)}
                disabled={isLoading}
                className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition-colors disabled:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile