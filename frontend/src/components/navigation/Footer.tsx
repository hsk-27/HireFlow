import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">HireFlow Platform</span>
          <span>•</span>
          <span>Production Enterprise Recruitment & ATS</span>
        </div>
        <div className="flex gap-6">
          <Link to="/jobs" className="hover:text-slate-700">Browse Jobs</Link>
          <Link to="/login" className="hover:text-slate-700">Sign In</Link>
          <a href="/swagger-ui/index.html" target="_blank" rel="noreferrer" className="hover:text-slate-700">
            OpenAPI Docs
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} HireFlow Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
