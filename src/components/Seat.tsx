import { Seat as SeatType } from '../lib/api';
import { X } from 'lucide-react';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onSelect: (seat: SeatType) => void;
  onClear?: (seat: SeatType) => void;
}

export default function Seat({ seat, isSelected, onSelect, onClear }: SeatProps) {
  const getStatusColor = () => {
    if (isSelected) return 'bg-yellow-400 border-yellow-500';
    if (seat.is_assigned) return 'bg-green-500 border-green-600';
    return 'bg-white border-gray-300';
  };

  const getTextColor = () => {
    if (isSelected || seat.is_assigned) return 'text-white';
    return 'text-gray-700';
  };

  // Calculate dynamic width based on content
  const hasContent = seat.is_assigned && (seat.register_number || seat.student_name || seat.semester || seat.department);
  const seatWidth = hasContent ? 'min-w-[80px] w-auto' : 'w-[60px]';

  return (
    <div
      onClick={() => onSelect(seat)}
      className={`relative cursor-pointer border-2 rounded-lg transition-all hover:scale-105 ${getStatusColor()} ${seatWidth} h-auto min-h-[60px] p-1 group`}
      title={
        seat.is_assigned
          ? `${seat.register_number || ''}\n${seat.student_name || ''}\n${seat.department || ''}\n${seat.semester || ''}`
          : 'Click to select'
      }
    >
      {seat.is_assigned && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear(seat);
          }}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
          title="Clear this seat"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex flex-col items-center justify-center space-y-0.5">
        <span className={`text-xs font-bold ${getTextColor()}`}>
          R{seat.row_number}C{seat.column_number}S{seat.seat_number}
        </span>
        {seat.is_assigned && seat.register_number && (
          <span className={`text-[11px] font-semibold ${getTextColor()} break-all text-center px-1`}>
            {seat.register_number}
          </span>
        )}
        {seat.is_assigned && seat.student_name && (
          <span className={`text-[10px] ${getTextColor()} truncate max-w-full text-center px-1`}>
            {seat.student_name}
          </span>
        )}
        {seat.is_assigned && seat.semester && (
          <span className={`text-[10px] ${getTextColor()} truncate max-w-full text-center px-1`}>
            {seat.semester}
          </span>
        )}
        {seat.is_assigned && seat.department && (
          <span className={`text-[10px] ${getTextColor()} truncate max-w-full text-center px-1`}>
            {seat.department}
          </span>
        )}
      </div>
    </div>
  );
}
