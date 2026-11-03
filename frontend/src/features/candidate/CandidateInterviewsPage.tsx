import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '@/services/apiServices';
import { Calendar, Clock, Video, MapPin, User, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';

export const CandidateInterviewsPage: React.FC = () => {
  const { data: pagedInterviews, isLoading } = useQuery({
    queryKey: ['candidateInterviews'],
    queryFn: () => interviewService.getCandidateInterviews(0, 50),
  });

  const interviews = pagedInterviews?.content || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">My Interview Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review upcoming technical, behavioral, and HR interview appointments.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No interviews currently scheduled</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            When recruiters shortlist your application and book an interview time slot, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((int) => (
            <div
              key={int.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-slate-900">{int.jobTitle}</span>
                  <StatusBadge status={int.interviewStatus} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {int.interviewType} Interview
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(int.scheduledStart || int.scheduledStartTime || Date.now()).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(int.scheduledStart || int.scheduledStartTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(int.scheduledEnd || int.scheduledEndTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({int.timezone || 'UTC'})
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-slate-400" /> Interviewer: {int.interviewerName}
                  </span>
                </div>

                {int.meetingLocation && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location: {int.meetingLocation}
                  </p>
                )}
              </div>

              {int.meetingLink && (
                <div className="shrink-0">
                  <a
                    href={int.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 shadow-sm transition"
                  >
                    <Video className="w-4 h-4" /> Join Video Meeting
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviewsPage;

