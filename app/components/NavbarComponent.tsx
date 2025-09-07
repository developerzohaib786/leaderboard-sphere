"use client";
import Button from "@/app/components/Button";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Upload Project', href: '/uploadfile' },
  { label: 'Chat Commumity', href: '#' },
  { label: 'FAQs', href: 'faqs' },
]

export default function Navbar() {
  const [isOpen, setisOpen] = useState(false);
  return (
    <>
      <section className="px-4 py-4 lg:py-8 lg:p-16 fixed w-full top-0 z-50">
        <div className="container">
          <div className="bg-neutral-900/70 backdrop-blur border border-white/15 rounded-[27px] md:rounded-full">
            <div className="flex items-center justify-between p-2 px-4 md:pr-2">

              {/* Left: Logo */}
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-codesandbox text-lime-400 h-9 w-auto"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                  <polyline points="7.5 19.79 7.5 14.6 3 12" />
                  <polyline points="21 12 16.5 14.6 16.5 19.79" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1={12} y1={22.08} x2={12} y2={12} />
                  <line x1={12} y1={22.08} x2={12} y2={12} />
                  <line x1={12} y1={22.08} x2={12} y2={12} />
                </svg>
                <span className="text-lime-400 font-bold text-xl">LeaderBoard Sphere</span>
              </div>

              {/* Middle: Nav Links */}
              <nav className="hidden lg:flex gap-6 font-medium text-white ">
                {navLinks.map((i) => (
                  <a href={i.href} key={i.label}>
                    {i.label}
                  </a>
                ))}
              </nav>

              {/* Right: Menu + Buttons */}
              <div className="flex items-center gap-4">
                {/* Mobile menu */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={() => setisOpen(!isOpen)}
                  className="feather feather-menu md:hidden cursor-pointer"
                >
                  <line x1={3} y1={12} x2={21} y2={12} className={twMerge('origin-center transition-transform duration-300', isOpen && 'rotate-45 translate-0.5 translate-y-1')} />
                  <line x1={3} y1={6} x2={21} y2={6} className={twMerge('origin-center transition-all duration-300', isOpen && 'opacity-0 rotate-180')} />
                  <line x1={3} y1={18} x2={21} y2={18} className={twMerge('origin-center transition-transform duration-300', isOpen && '-rotate-45')} />
                </svg>

                {/* Desktop buttons */}
                <Button variant="secondary" className="hidden md:inline-flex items-center">
                  Log In
                </Button>
                <Button variant="primary" className="hidden md:inline-flex items-center">
                  Sign Up
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div className=" overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                >
                  <div className="flex flex-col items-center gap-4 py-4">
                    {navLinks.map((i) =>
                      <a href={i.href} key={i.label} className="">{i.label}</a>
                    )}
                    <Button variant="primary">Log In</Button>
                    <Button variant="secondary">Sign Up</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <div className="pb-[86px] md:pb-[98px] lg-px-[130px]"></div>
    </>

  )
}