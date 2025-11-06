import React, { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import daitLogo from "../assets/dait.png";
import { Link } from "lucide-react";

export default function NavigationBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full  bg-gray-900  shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a
            href="/"
            className="flex items-center gap-3 text-slate-900 hover:opacity-90"
            aria-label="Home"
          >
            <img
              src={daitLogo}
              alt="DAIT Logo"
              className="h-14 w-14 rounded-2xl shadow-xl object-cover"
            />
            <span className="font-semibold text-white text-xl select-none">CIT305</span>
          </a>

          <div className="hidden md:flex flex-1 justify-center items-center gap-6">
            <Link
              to="/display"
              className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium hover:text-white hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              Gallery
            </Link>



            <SignedIn>
              <Link
                to="/create"
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                Create Post
              </Link>
            </SignedIn>

            <SignedOut>
              <button
                onClick={() => alert("Please sign in to create a post.")}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                Create Post
              </button>
            </SignedOut>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <SignedIn>
                <UserButton />
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 border text-white border-gray-300 rounded-full hover:bg-gray-50  hover:text-black transition-all duration-200">
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-red-400 text-white rounded-full hover:bg-red-900 transition-all duration-200">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>

            <button
              onClick={() => setOpen((s) => !s)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all duration-200"
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${open ? "block" : "hidden"} border-t bg-white shadow-sm`}>
        <div className="px-4 pt-4 pb-4 space-y-2">
          <Link
            to="/display"
            onClick={() => setOpen(false)}
            className="block text-gray-700 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            Gallery
          </Link>

          <SignedIn>
            <a
              href="/create"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200"
            >
              Create Post
            </a>
          </SignedIn>

          <SignedOut>
            <button
              onClick={() => {
                setOpen(false);
                alert("Please sign in to create a post.");
              }}
              className="block px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200"
            >
              Create Post
            </button>
          </SignedOut>

          <div className="pt-3 border-t mt-2 flex flex-col gap-2">
            <SignedIn>
              <div className="px-3">
                <UserButton />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="px-3 flex gap-2">
                <SignInButton mode="modal">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200"
                  >
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}