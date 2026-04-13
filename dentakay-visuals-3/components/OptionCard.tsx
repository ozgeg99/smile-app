import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface OptionCardProps {
  title: string;
  desc: string;
  icon?: ReactNode;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, desc, icon, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all group"
    >
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {icon || <div className="w-2 h-2 rounded-full bg-current" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 self-center group-hover:text-blue-500" />
      </div>
    </button>
  );
};

export default OptionCard;