import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
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
function App() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUpPage />} />
  
  {/* Prevent getting stuck on callback routes */}
  <Route path="/sign-up/sso-callback?" element={<Navigate to="/" />} />
  <Route path="/login/sso-callback?" element={<Navigate to="/" />} />
{/* Protected Routes */}
          <Route
            path="/my-appointments"
            element={
              <>
                <SignedIn>
                  <MyAppointments />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/profile"
            element={
              <>
                <SignedIn>
                  <Profile />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route path="/appointment/:docId" element={
            <>
              <SignedIn>
                <Appointment />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default App;