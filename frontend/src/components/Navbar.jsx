import React, { useState } from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
        {token && (
          <NavLink to="/my-appointments">
            <li>My Appointments</li>
          </NavLink>
        )}
        <NavLink to="/about">
          <li>About</li>
        </NavLink>
        <NavLink to="/contact">
          <li>Contact</li>
        </NavLink>
      </ul>

      {/* Auth Buttons and Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          {token ? (
            <div className="flex items-center gap-4">
              <NavLink to="/profile">
                <button className="text-gray-600 hover:text-gray-800">Profile</button>
              </NavLink>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Sign In
            </button>
          )}
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
              {token && (
                <NavLink to="/my-appointments" onClick={() => setShowMenu(false)}>
                  <li>My Appointments</li>
                </NavLink>
              )}
              <NavLink to="/about" onClick={() => setShowMenu(false)}>
                <li>About</li>
              </NavLink>
              <NavLink to="/contact" onClick={() => setShowMenu(false)}>
                <li>Contact</li>
              </NavLink>
            </ul>
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200">
              {token ? (
                <div className="flex flex-col gap-2">
                  <NavLink to="/profile" onClick={() => setShowMenu(false)}>
                    <button className="w-full text-left text-gray-600 hover:text-gray-800">
                      Profile
                    </button>
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setShowMenu(false);
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;