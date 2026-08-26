import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-borderLight sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">SkyPrime Logistics</span>
          </div>
          <div className="hidden sm:flex space-x-8">
            <a href="#" className="text-accent font-semibold border-b-2 border-accent px-1 py-5">
              Track
            </a>
            <a href="#" className="text-gray-500 hover:text-darkSlate px-1 py-5 transition-colors font-medium">
              Ship
            </a>
            <a href="#" className="text-gray-500 hover:text-darkSlate px-1 py-5 transition-colors font-medium">
              Enterprise Accounts
            </a>
            <a href="#" className="text-gray-500 hover:text-darkSlate px-1 py-5 transition-colors font-medium">
              Support
            </a>
          </div>
          <div className="flex items-center">
            <button className="text-primary font-semibold hover:bg-slateLight px-4 py-2 rounded-md transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
