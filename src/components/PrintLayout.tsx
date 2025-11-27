import { useEffect, useState } from 'react';
import { api, Hall, Seat as SeatType } from '../lib/api';

interface PrintLayoutProps {
  hall: Hall;
}

export default function PrintLayout({ hall }: PrintLayoutProps) {
  const [seats, setSeats] = useState<SeatType[]>([]);

  useEffect(() => {
    fetchData();
  }, [hall._id]);

  const fetchData = async () => {
    try {
      const seatsData = await api.getSeats(hall._id);
      setSeats(seatsData || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const groupSeatsByBench = () => {
    const benches: { [key: string]: SeatType[] } = {};
    seats.forEach((seat) => {
      const key = `${seat.row_number}-${seat.column_number}`;
      if (!benches[key]) {
        benches[key] = [];
      }
      benches[key].push(seat);
    });
    return benches;
  };

  const renderPrintLayout = () => {
    const benches = groupSeatsByBench();
    const rows: JSX.Element[] = [];

    for (let row = 1; row <= hall.rows; row++) {
      const columns: JSX.Element[] = [];

      for (let col = 1; col <= hall.columns; col++) {
        const benchSeats = benches[`${row}-${col}`] || [];
        benchSeats.sort((a, b) => a.seat_number - b.seat_number);

        columns.push(
          <div key={`${row}-${col}`} className="flex items-center space-x-1 p-1 bg-gray-50 rounded border border-gray-200">
            {benchSeats.map((seat) => (
              <div
                key={seat._id}
                className={`min-w-[60px] w-auto h-auto min-h-[50px] border-2 rounded flex flex-col items-center justify-center text-xs transition-all p-1 ${
                  seat.is_assigned
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-300'
                }`}
              >
                <div className="font-bold text-gray-600 text-[9px]">
                  R{seat.row_number}C{seat.column_number}S{seat.seat_number}
                </div>
                {seat.is_assigned && seat.register_number && (
                  <div className="font-bold text-blue-900 mt-0.5 px-1 text-center text-[10px]">{seat.register_number}</div>
                )}
                {seat.is_assigned && seat.student_name && (
                  <div className="text-[9px] text-gray-700 px-1 text-center truncate max-w-full">
                    {seat.student_name}
                  </div>
                )}
                {seat.is_assigned && seat.semester && (
                  <div className="text-[8px] text-gray-600 px-1 text-center truncate max-w-full">
                    {seat.semester}
                  </div>
                )}
                {seat.is_assigned && seat.department && (
                  <div className="text-[8px] font-medium text-blue-700 px-1 text-center truncate max-w-full">
                    {seat.department}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      rows.push(
        <div key={row} className="mb-2">
          <div className="flex items-center">
            <div className="text-xs font-semibold text-gray-600 w-6">R{row}</div>
            <div className="flex-1 flex justify-around gap-2">{columns}</div>
          </div>
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="print-only">
      <div className="page-break">
        {/* Hall Name Header */}
        <div className="mb-4 text-center border-b-2 border-gray-800 pb-2">
          <h1 className="text-xl font-bold text-gray-900">{hall.name}</h1>
          <div className="text-xs text-gray-600 mt-1">
            Examination Seating Chart
          </div>
        </div>

        {/* Classroom Board */}
        <div className="mb-4 p-3 bg-gradient-to-b from-green-800 to-green-900 rounded border-2 border-yellow-400">
          <div className="text-yellow-100 text-center text-sm font-bold">
            Front of Classroom
          </div>
        </div>

        {/* Seating Layout */}
        <div className="bg-white p-3 rounded border border-gray-300">
          {renderPrintLayout()}
        </div>

        {/* Back of Classroom */}
        <div className="mt-4 p-2 bg-gray-100 rounded border border-gray-400 text-center">
          <div className="text-sm font-bold text-gray-700">Back of Classroom</div>
        </div>
      </div>
    </div>
  );
}
