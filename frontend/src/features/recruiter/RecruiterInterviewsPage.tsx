import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterApi } from '../../services/apiServices';
import { Interview, InterviewType, FeedbackRecommendation, Application } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Calendar, Clock, Video, Plus, CheckCircle, XCircle, MessageSquare, Star, AlertCircle } from 'lucide-react';

export default function RecruiterInterviewsPage() {
  const queryClient = useQueryClient();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState<Interview | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Schedule form state
  const [scheduleData, setScheduleData] = useState({
    applicationId: '',
    roundNumber: 1,
    interviewType: 'TECHNICAL' as InterviewType,
    scheduledStartTime: '',
    scheduledEndTime: '',
    locationUrl: '',
    notes: '',
  });

  // Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    technicalScore: 4,
    communicationScore: 4,
    problemSolvingScore: 4,
    culturalFitScore: 4,
    overallRating: 4,
    recommendation: 'HIRE' as FeedbackRecommendation,
    strengths: '',
    weaknesses: '',
    detailedNotes: '',
  });

  // Fetch interviews
  const { data: interviewsData, isLoading, error } = useQuery({
    queryKey: ['recruiter-interviews'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyInterviews();
      return res.data.data;
    },
  });

  const interviews: Interview[] = Array.isArray(interviewsData)
    ? interviewsData
    : (interviewsData as any)?.content || [];

  // Fetch eligible applications to schedule
  const { data: eligibleApps } = useQuery({
    queryKey: ['recruiter-eligible-apps'],
    queryFn: async () => {
      const res = await recruiterApi.getApplications({ page: 0, size: 100 });
      // Can schedule interviews for applicants in SHORTLISTED, INTERVIEW, or UNDER_REVIEW
      return (
        res.data.data.content?.filter((a: Application) =>
          ['SHORTLISTED', 'INTERVIEW', 'UNDER_REVIEW'].includes(a.status)
        ) || []
      );
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (payload: any) => recruiterApi.scheduleInterview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
      setIsScheduleModalOpen(false);
      setScheduleData({
        applicationId: '',
        roundNumber: 1,
        interviewType: 'TECHNICAL',
        scheduledStartTime: '',
        scheduledEndTime: '',
        locationUrl: '',
        notes: '',
      });
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to schedule interview');
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({
      interviewId,
      feedback,
    }: {
      interviewId: string;
      feedback: any;
    }) => recruiterApi.submitInterviewFeedback(interviewId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
      setSelectedInterviewForFeedback(null);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to submit feedback');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ interviewId, reason }: { interviewId: string; reason: string }) =>
      recruiterApi.cancelInterview(interviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to cancel interview');
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!scheduleData.applicationId) {
      setFormError('Please select a candidate application');
      return;
    }
    if (!scheduleData.scheduledStartTime || !scheduleData.scheduledEndTime) {
      setFormError('Please specify start and end times');
      return;
    }
    if (new Date(scheduleData.scheduledEndTime) <= new Date(scheduleData.scheduledStartTime)) {
      setFormError('End time must be after start time');
      return;
    }

    scheduleMutation.mutate({
      applicationId: scheduleData.applicationId,
      roundNumber: Number(scheduleData.roundNumber),
      interviewType: scheduleData.interviewType,
      scheduledStartTime: new Date(scheduleData.scheduledStartTime).toISOString(),
      scheduledEndTime: new Date(scheduleData.scheduledEndTime).toISOString(),
      locationUrl: scheduleData.locationUrl,
      notes: scheduleData.notes,
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewForFeedback) return;
    setFormError(null);

    feedbackMutation.mutate({
      interviewId: selectedInterviewForFeedback.id,
      feedback: feedbackData,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Interview Management & Feedback
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Coordinate rounds, track calendar schedules, and record structured evaluation scorecards.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsScheduleModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Interview
          </Button>
        </div>
      </div>

      {/* Interviews Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load interview schedules.
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No interviews scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">
            Schedule a round with shortlisted candidates to evaluate their skills.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Candidate / Role</th>
                <th className="px-6 py-3">Round & Type</th>
                <th className="px-6 py-3">Scheduled Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Meeting Link</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {interviews.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{item.candidateName}</div>
                    <div className="text-xs text-gray-500">{item.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">Round {item.roundNumber}</div>
                    <div className="text-xs text-gray-500">{item.interviewType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(item.scheduledStartTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.scheduledStartTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(item.scheduledEndTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4">
                    {item.locationUrl ? (
                      <a
                        href={item.locationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-800"
                      >
                        <Video className="mr-1 h-3.5 w-3.5" /> Meeting Link
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">On-site / Not provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {item.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => setSelectedInterviewForFeedback(item)}
                          className="inline-flex items-center rounded bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                        >
                          <Star className="mr-1 h-3.5 w-3.5" /> Add Scorecard
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for cancelling interview:');
                            if (reason) {
                              cancelMutation.mutate({ interviewId: item.id, reason });
                            }
                          }}
                          className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {item.status === 'COMPLETED' && (
                      <span className="text-xs font-medium text-emerald-600">✓ Evaluated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setFormError(null);
        }}
        title="Schedule Interview Round"
        size="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Candidate Application *
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={scheduleData.applicationId}
              onChange={(e) => setScheduleData({ ...scheduleData, applicationId: e.target.value })}
            >
              <option value="">Select candidate to interview...</option>
              {eligibleApps?.map((a: Application) => (
                <option key={a.id} value={a.id}>
                  {a.candidateName} — {a.jobTitle} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Round Number
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
                value={scheduleData.roundNumber}
                onChange={(e) => setScheduleData({ ...scheduleData, roundNumber: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Interview Type
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
                value={scheduleData.interviewType}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, interviewType: e.target.value as InterviewType })
                }
              >
                <option value="PHONE_SCREEN">Phone Screen</option>
                <option value="TECHNICAL">Technical Round</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="HIRING_MANAGER">Hiring Manager</option>
                <option value="HR">HR Round</option>
                <option value="FINAL">Final Leadership</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-xs shadow-sm"
                value={scheduleData.scheduledStartTime}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, scheduledStartTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-xs shadow-sm"
                value={scheduleData.scheduledEndTime}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, scheduledEndTime: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Meeting Link or Location
            </label>
            <input
              type="text"
              placeholder="https://meet.google.com/xyz-abc or Conference Room A"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              value={scheduleData.locationUrl}
              onChange={(e) => setScheduleData({ ...scheduleData, locationUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Notes for Candidate (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Topics to prepare, agenda, interviewers..."
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              value={scheduleData.notes}
              onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={scheduleMutation.isPending}>
              Schedule Interview
            </Button>
          </div>
        </form>
      </Modal>

      {/* Interview Feedback Scorecard Modal */}
      <Modal
        isOpen={selectedInterviewForFeedback !== null}
        onClose={() => {
          setSelectedInterviewForFeedback(null);
          setFormError(null);
        }}
        title={`Evaluation Scorecard: ${selectedInterviewForFeedback?.candidateName}`}
        size="lg"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Technical Competence (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={feedbackData.technicalScore}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, technicalScore: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Communication (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={feedbackData.communicationScore}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, communicationScore: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Problem Solving (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={feedbackData.problemSolvingScore}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, problemSolvingScore: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Cultural Alignment (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={feedbackData.culturalFitScore}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, culturalFitScore: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Overall Rating (1-5) *
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={feedbackData.overallRating}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, overallRating: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Hiring Recommendation *
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={feedbackData.recommendation}
                onChange={(e) =>
                  setFeedbackData({
                    ...feedbackData,
                    recommendation: e.target.value as FeedbackRecommendation,
                  })
                }
              >
                <option value="STRONG_HIRE">Strong Hire</option>
                <option value="HIRE">Hire</option>
                <option value="LEANING_HIRE">Leaning Hire</option>
                <option value="LEANING_REJECT">Leaning Reject</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Key Strengths
              </label>
              <textarea
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-xs"
                placeholder="Architecture depth, clean code..."
                value={feedbackData.strengths}
                onChange={(e) => setFeedbackData({ ...feedbackData, strengths: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Areas for Growth
              </label>
              <textarea
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-xs"
                placeholder="Needs more experience with distributed caching..."
                value={feedbackData.weaknesses}
                onChange={(e) => setFeedbackData({ ...feedbackData, weaknesses: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Detailed Assessment Notes *
            </label>
            <textarea
              rows={3}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder="Candidate answered concurrency questions with high fidelity..."
              value={feedbackData.detailedNotes}
              onChange={(e) => setFeedbackData({ ...feedbackData, detailedNotes: e.target.value })}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedInterviewForFeedback(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={feedbackMutation.isPending}>
              Submit Evaluation Scorecard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
