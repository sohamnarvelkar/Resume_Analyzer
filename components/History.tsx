
import React from 'react';
import { Clock, Trash2, ExternalLink, Filter, Search, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ items, onSelectItem, onDeleteItem }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Analysis History</h2>
          <p className="text-slate-500 text-sm">Review and compare your past screening sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <Clock className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">No history items found</p>
          <p className="text-slate-300 text-xs mt-1">Start a new analysis to see items here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative"
              onClick={() => onSelectItem(item)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.role === 'Tech' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  item.role === 'Executive' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                  'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {item.role}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">
                {item.data.job_analysis.seniority_level} Role
              </h3>
              <p className="text-xs text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center -space-x-2">
                  {[...Array(Math.min(item.candidateCount, 3))].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      C{i+1}
                    </div>
                  ))}
                  {item.candidateCount > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      +{item.candidateCount - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-blue-600 text-xs font-bold group-hover:translate-x-1 transition-transform">
                  View Results
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
