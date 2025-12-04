import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavBar: React.FC = () => {
  return (
    <nav className="h-12 bg-stone-950 border-b border-stone-800 flex items-center px-6 shrink-0 z-40 relative shadow-md">
      <div className="flex space-x-8">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-sm font-medium tracking-wide transition-colors duration-200 ${
              isActive
                ? "text-amber-500 border-b-2 border-amber-500 pb-0.5"
                : "text-stone-400 hover:text-stone-200"
            }`
          }
        >
          FLIGHT BOOK & MAP
        </NavLink>
        <NavLink
          to="/journey"
          className={({ isActive }) =>
            `text-sm font-medium tracking-wide transition-colors duration-200 ${
              isActive
                ? "text-amber-500 border-b-2 border-amber-500 pb-0.5"
                : "text-stone-400 hover:text-stone-200"
            }`
          }
        >
          HERO'S JOURNEY
        </NavLink>
        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `text-sm font-medium tracking-wide transition-colors duration-200 ${
              isActive
                ? "text-amber-500 border-b-2 border-amber-500 pb-0.5"
                : "text-stone-400 hover:text-stone-200"
            }`
          }
        >
          GALLERY
        </NavLink>
      </div>
    </nav>
  );
};

