import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const NavBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 ${
      isActive
        ? "text-amber-500 border-b-2 border-amber-500 pb-0.5"
        : "text-stone-400 hover:text-stone-200"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${
      isActive
        ? "text-amber-500 bg-stone-900/50 border-l-4 border-amber-500"
        : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/30 border-l-4 border-transparent"
    }`;

  return (
    <nav className="bg-stone-950 border-b border-stone-800 shrink-0 z-40 relative shadow-md">
      {/* Desktop Nav */}
      <div className="h-12 items-center px-6 hidden md:flex">
        <div className="flex space-x-8">
          <NavLink to="/" className={navLinkClass}>
            FLIGHT BOOK & MAP
          </NavLink>
          <NavLink to="/journey" className={navLinkClass}>
            HERO'S JOURNEY
          </NavLink>
          <NavLink to="/gallery" className={navLinkClass}>
            GALLERY
          </NavLink>
        </div>
      </div>

      {/* Mobile Nav Header */}
      <div className="flex h-12 items-center justify-between px-4 md:hidden">
        <span className="text-amber-500 font-typewriter text-xs uppercase tracking-[0.2em]">
          Robin Glen
        </span>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'max-h-48 border-t border-stone-800' : 'max-h-0'
        }`}
      >
        <div className="py-2 bg-stone-950">
          <NavLink 
            to="/" 
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FLIGHT BOOK & MAP
          </NavLink>
          <NavLink 
            to="/journey" 
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            HERO'S JOURNEY
          </NavLink>
          <NavLink 
            to="/gallery" 
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            GALLERY
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

