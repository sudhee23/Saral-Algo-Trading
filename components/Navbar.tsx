"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { useMe } from "../hooks/useMe";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isLoading } = useMe();

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/signup");

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.reload();
  };

  return (
    <nav className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center shadow-md relative">
      <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>ALTRA</h1>
      <div>
        {isLoading ? (
          <span className="text-gray-300">Loading...</span>
        ) : user ? (
          <div className="relative">
            <FaUserCircle
              size={28}
              className="cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
                <button
                  onClick={() => { setShowDropdown(false); router.push('/profile'); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-x-4">
            <button
              onClick={handleLogin}
              className="bg-white text-[#001f3f] px-4 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
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
