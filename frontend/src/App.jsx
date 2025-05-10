import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MyAppointments from "./pages/MyAppointments";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SignUpPage from "./pages/SignUpPage";
import FloatingChat from "./components/FloatingChat";
import ChatbotPage from "./components/ChatBotPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/my-appointments"
            element={
              <PrivateRoute>
                <MyAppointments />
              </PrivateRoute>
            }
          />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointment/:docId"
            element={
              <PrivateRoute>
                <Appointment />
              </PrivateRoute>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </main>
      <FloatingChat />
      <Footer/>
    </div>
  );
}

export default App;