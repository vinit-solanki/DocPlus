import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`http://localhost:3000/api/auth/login`, formData)
      console.log("Login API Response:", response.data)

      // Store token and user data
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      console.log("Login successful:", response.data.user)
      navigate("/")
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your network or server configuration."
      setError(errorMessage)
      console.error("Login error:", err.response?.data, err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-3 py-7 px-4 text-gray-800">
      <div className="flex flex-col justify-center items-center max-w-xl w-full space-y-2">
        <div className="text-center mb-3">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Doc<span className="text-green-600">+</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button onClick={() => navigate("/sign-up")} className="text-green-600 hover:text-green-700">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login