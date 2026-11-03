import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/apiServices';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Briefcase, Filter, X } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';

export const JobListingPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workplaceType, setWorkplaceType] = useState('');
  const [page, setPage] = useState(0);

  const { data: pagedData, isLoading, refetch } = useQuery({
    queryKey: ['publicJobs', keyword, location, employmentType, workplaceType, page],
    queryFn: () =>
      jobService.searchPublicJobs({
        keyword: keyword || undefined,
        location: location || undefined,
        employmentType: employmentType || undefined,
        workplaceType: workplaceType || undefined,
        page,
        size: 9,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    refetch();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setEmploymentType('');
    setWorkplaceType('');
    setPage(0);
  };

  const jobs = pagedData?.content || [];
  const totalPages = pagedData?.totalPages || 0;
  const totalElements = pagedData?.totalElements || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Explore Open Positions</h1>
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Job title, keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="City, state, or remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
          </div>

          <div>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Workplace Types</option>
              <option value="ONSITE">Onsite</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Search
            </Button>
            {(keyword || location || employmentType || workplaceType) && (
              <Button type="button" variant="outline" onClick={handleClearFilters} title="Clear Filters">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
          <span>{totalElements} published job openings</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-800">No jobs match your criteria</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, removing location filters, or checking back soon.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 truncate max-w-[70%]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.companyName}
                    </span>
                    <StatusBadge status={job.workplaceType} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-2">{job.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{job.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location}
                    </span>
                    <span className="font-medium text-slate-700">{job.employmentType.replace('_', ' ')}</span>
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="text-xs font-semibold text-slate-800">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} {job.salaryCurrency}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            totalElements={totalElements}
          />
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;
