"use client";

import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export default function Navbar({ isLoggedIn, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
  <section className="relative overflow-x-hidden">
      <nav className="bg-white  backdrop-blur-md text-black shadow-md sticky z-1000 w-screen">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wide">
          CapReel Pro
        </Link>

        {/* Mid Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-gray-600 transition font-medium">
            Home
          </Link>
          <Link href="/upload" className="hover:text-gray-600 transition font-medium  ">
            Upload Video
          </Link>
        </div>

        {/* Right Side (Logout) */}
        <div>
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col space-y-1 ml-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-2 space-y-2">
          <Link
            href="/"
            className="block hover:text-gray-200 transition"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/upload"
            className="block hover:text-gray-200 transition"
            onClick={() => setMenuOpen(false)}
          >
            Upload Video
          </Link>
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="block w-full text-left bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  </section>
  );
}
