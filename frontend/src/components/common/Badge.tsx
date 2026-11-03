import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const formatted = status ? status.replace(/_/g, ' ') : '';

  switch (status) {
    case 'APPROVED':
    case 'PUBLISHED':
    case 'HIRED':
    case 'ACCEPTED':
    case 'ELIGIBLE':
    case 'COMPLETED':
      return <Badge variant="success">{formatted}</Badge>;

    case 'SUBMITTED':
    case 'NEW':
      return <Badge variant="neutral">{formatted}</Badge>;

    case 'UNDER_REVIEW':
    case 'SHORTLISTED':
    case 'INTERVIEW':
    case 'SENT':
    case 'SCHEDULED':
    case 'RESCHEDULED':
      return <Badge variant="info">{formatted}</Badge>;

    case 'PENDING':
    case 'REVIEW_REQUIRED':
    case 'DRAFT':
    case 'CONTACTED':
    case 'INVITED':
      return <Badge variant="warning">{formatted}</Badge>;

    case 'REJECTED':
    case 'SUSPENDED':
    case 'CLOSED':
    case 'INELIGIBLE':
    case 'CANCELLED':
    case 'EXPIRED':
    case 'DECLINED':
    case 'WITHDRAWN':
    case 'OFFER_DECLINED':
      return <Badge variant="danger">{formatted}</Badge>;

    default:
      return <Badge variant="neutral">{formatted || 'Unknown'}</Badge>;
  }
};

export default Badge;
