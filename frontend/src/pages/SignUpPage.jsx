"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `https://docplus-backend-ruby.vercel.app`

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      console.log("Registering user with data:", formData)
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "patient",
      })

      console.log("Registration response:", response.data)

      // Validate response
      if (!response.data.token || !response.data.user) {
        throw new Error("Invalid response from server")
      }

      // Store token and user data
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      console.log("Registration successful:", response.data.user)
      navigate("/profile") // Redirect to profile to complete setup
    } catch (err) {
      console.error("Registration error:", err)
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 400
          ? "Invalid registration details. Please check your information."
          : "Registration failed. Please check your network or try again later.")
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left Column - Heading and Description */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="text-left lg:text-left space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Create your Doc<span className="text-green-600">+</span> account
              </h2>
              <p className="text-xl text-gray-600">Join thousands of patients and doctors on our platform</p>

              {/* Feature Points */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">24/7 Medical Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">Verified Doctors</span>
                </div>
              </div>
            </div>
            {/* Terms and Privacy Section */}
            <div className="text-sm mt-2">
              <p className="text-gray-500">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium transition-all">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium transition-all">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="flex flex-col justify-center items-center lg:w-1/2">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden p-6 w-full max-w-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-green-600 hover:text-green-700">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage