import { useEffect, useState } from 'react';
import { api, Hall, Seat } from '../lib/api';
import { FileDown } from 'lucide-react';

export default function Reports() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [stats, setStats] = useState<{ [key: string]: { total: number; assigned: number } }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hallsData = await api.getHalls();

      if (hallsData) {
        setHalls(hallsData);

        const statsData: { [key: string]: { total: number; assigned: number } } = {};
        for (const hall of hallsData) {
          const seatsData = await api.getSeats(hall._id);

          if (seatsData) {
            statsData[hall._id] = {
              total: seatsData.length,
              assigned: seatsData.filter((s: Seat) => s.is_assigned).length,
            };
          }
        }
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const exportToCSV = async (hallId: string, hallName: string) => {
    try {
      const seats = await api.getSeats(hallId);
      const assignedSeats = seats.filter((s) => s.is_assigned);

      if (assignedSeats.length === 0) {
        alert('No assigned seats to export');
        return;
      }

      const csvContent = [
        ['Hall Name', 'Row', 'Column', 'Seat', 'Register Number', 'Student Name', 'Department', 'Semester'],
        ...assignedSeats.map((seat) => [
          hallName,
          seat.row_number,
          seat.column_number,
          seat.seat_number,
          seat.register_number || '',
          seat.student_name || '',
          seat.department || '',
          seat.semester || '',
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${hallName.replace(/\s+/g, '_')}_seating.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">View statistics and export seating data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{halls.length}</div>
          <div className="text-gray-600">Total Halls</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Object.values(stats).reduce((acc, s) => acc + s.assigned, 0)}
          </div>
          <div className="text-gray-600">Total Assigned Seats</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-600 mb-2">
            {Object.values(stats).reduce((acc, s) => acc + s.total, 0)}
          </div>
          <div className="text-gray-600">Total Seat Capacity</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Hall-wise Reports</h3>

        <div className="space-y-4">
          {halls.map((hall) => {
            const hallStats = stats[hall._id] || { total: 0, assigned: 0 };
            const percentage = hallStats.total > 0 ? (hallStats.assigned / hallStats.total) * 100 : 0;

            return (
              <div key={hall._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{hall.name}</h4>
                    <p className="text-sm text-gray-600">
                      {hallStats.assigned} / {hallStats.total} seats assigned
                    </p>
                  </div>
                  <button
                    onClick={() => exportToCSV(hall._id, hall.name)}
                    disabled={hallStats.assigned === 0}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% occupied</p>
              </div>
            );
          })}

          {halls.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No halls available. Create your first hall to see reports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
