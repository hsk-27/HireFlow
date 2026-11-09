import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Activity, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-obsidian-950 border-t border-obsidian-850 text-slate-400 mt-auto pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-obsidian-850">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white font-black text-sm">
                HF
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                HIRE<span className="text-primary-400">FLOW</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise Applicant Tracking & Talent Acquisition Infrastructure. High-velocity hiring pipelines, automated eligibility screening, and conflict-free interview coordination.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational • 99.98% SLA</span>
            </div>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-primary-400 transition">
                  Public Job Requisitions
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition">
                  Employer Verification
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Deterministic Eligibility Engine</span>
              </li>
              <li>
                <span className="text-slate-400">Structured 5-Point Calibration Scorecards</span>
              </li>
              <li>
                <span className="text-slate-400">Passive Talent Pool Sourcing</span>
              </li>
            </ul>
          </div>

          {/* Security & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Security & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Multi-Tenant Isolation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary-400" />
                <span>JWT Refresh-Token Rotation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-copper-400" />
                <span>Immutable Audit Event Trail</span>
              </li>
              <li>
                <span className="text-slate-400">SHA-256 Document Integrity</span>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Developer & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/swagger-ui/index.html"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary-400 transition flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  REST API Documentation (OpenAPI)
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-400 transition">
                  Platform Console Sign-In
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Privacy & Data Protection</span>
              </li>
              <li>
                <span className="text-slate-400">Enterprise Service Terms</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} HireFlow Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4 text-[11px]">
            <span>Production Release v1.0.0</span>
            <span>•</span>
            <span>Enterprise Monolith Architecture</span>
            <span>•</span>
            <span>PostgreSQL & Spring Boot</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
