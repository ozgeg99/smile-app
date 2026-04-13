import React from 'react';

interface ReviewRowProps {
  label: string;
  value?: string;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 last:border-0 pb-2 last:pb-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-medium text-slate-900 text-sm">{value || '-'}</span>
    </div>
  );
};

export default ReviewRow;