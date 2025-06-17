"use client";

import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAuthToggle = () => {
    setIsLoggedIn((prev) => !prev);
  };

  return (
    <nav className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">ALTRA</h1>
      <div>
        {isLoggedIn ? (
          <FaUserCircle size={28} />
        ) : (
          <div className="space-x-4">
            <button
              onClick={handleAuthToggle}
              className="bg-white text-[#001f3f] px-4 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Login
            </button>
            <button
              onClick={handleAuthToggle}
              className="bg-white text-[#001f3f] px-4 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Signup
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
