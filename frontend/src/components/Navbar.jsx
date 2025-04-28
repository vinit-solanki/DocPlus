import React, { useState } from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserButton, useUser, SignedIn, SignedOut } from "@clerk/clerk-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative w-screen flex items-center justify-between p-4 text-sm border-b border-b-gray-500">
      <h2 className="text-3xl font-bold flex justify-center items-center">
        Doc<span className="text-green-300 text-4xl">+</span>
      </h2>
      
      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center justify-center gap-5 font-medium">
        <NavLink to="/">
          <li>Home</li>
        </NavLink>
        <NavLink to="/doctors">
          <li>All Doctors</li>
        </NavLink>
        <SignedIn>
          <NavLink to="/my-appointments">
            <li>My Appointments</li>
          </NavLink>
        </SignedIn>
        <NavLink to="/about">
          <li>About</li>
        </NavLink>
        <NavLink to="/contact">
          <li>Contact</li>
        </NavLink>
        <SignedIn>
          {/* <NavLink to="/profile">
            <li>My Profile</li>
          </NavLink> */}
        </SignedIn>
      </ul>

      {/* Auth Buttons and Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10"
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
          <SignedOut>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Sign In
            </button>
          </SignedOut>
        </div>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="md:hidden"
        >
          {showMenu ? (
            <img src={assets.cross_icon} className="w-6 h-6" alt="close menu" />
          ) : (
            <img src={assets.menu_icon} className="w-6 h-6" alt="open menu" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden z-50">
          <div className="flex flex-col p-4">
            <ul className="flex flex-col gap-4 mb-4">
              <NavLink to="/" onClick={() => setShowMenu(false)}>
                <li>Home</li>
              </NavLink>
              <NavLink to="/doctors" onClick={() => setShowMenu(false)}>
                <li>All Doctors</li>
              </NavLink>
              <SignedIn>
                <NavLink to="/my-appointments" onClick={() => setShowMenu(false)}>
                  <li>My Appointments</li>
                </NavLink>
              </SignedIn>
              <NavLink to="/about" onClick={() => setShowMenu(false)}>
                <li>About</li>
              </NavLink>
              <NavLink to="/contact" onClick={() => setShowMenu(false)}>
                <li>Contact</li>
              </NavLink>
              <SignedIn>
                {/* <NavLink to="/profile" onClick={() => setShowMenu(false)}>
                  <li>My Profile</li>
                </NavLink> */}
              </SignedIn>
            </ul>
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </SignedIn>
              <SignedOut>
                <button
                  onClick={() => {
                    navigate("/login");
                    setShowMenu(false);
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Sign In
                </button>
              </SignedOut>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;