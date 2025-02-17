"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { href: "/home", label: "Home" },
    {
      href: "#",
      label: "About",
      dropdown: [
        { href: "/about", label: "About Us" },
        { href: "/executive-body", label: "Executive Body" },
      ],
    },
    { href: "/news", label: "News" },
    { href: "/gallery", label: "Gallery" },
    { href: "/register", label: "Register/Login" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? "bg-ss-blue/90 backdrop-blur-md shadow-md py-3" : "bg-ss py-6"
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/gesscam.svg"
            alt="GESSCAM Logo"
            width={150}
            height={50}
            className="transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <div key={index} className="relative group">
              {item.dropdown ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(index === dropdownOpen ? null : index);
                    }}
                    className="text-xl font-medium text-ss-white hover:text-ss-yellow flex items-center space-x-1 transition-transform duration-200"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {dropdownOpen === index && (
                    <div className="absolute left-0 mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg z-50 transform transition-transform duration-200 scale-95 group-hover:scale-100">
                      <div className="py-1">
                        {item.dropdown.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={dropdownIndex}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm hover:bg-ss-blue hover:text-white rounded"
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="text-xl font-medium text-ss-white hover:text-ss-yellow transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          {/* Admin Status & Logout */}
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-green-400 font-semibold">
                {isAdmin ? "Admin Panel" : "Logged In"}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 px-3 py-1 rounded text-white hover:bg-blue-400 transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button variant="text" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pt-4 pb-3 space-y-3 bg-ss-blue transition-opacity duration-300 opacity-95">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(index === dropdownOpen ? null : index)}
                    className="w-full text-left text-ss-white flex items-center space-x-1"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {dropdownOpen === index && (
                    <div className="pl-4">
                      {item.dropdown.map((dropdownItem, dropdownIndex) => (
                        <Link
                          key={dropdownIndex}
                          href={dropdownItem.href}
                          className="block py-2 text-sm text-ss-white hover:text-ss-yellow transition-colors"
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href} className="block text-ss-white hover:text-ss-yellow">
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

