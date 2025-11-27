import { useEffect, useState } from 'react';
import { api, Hall } from '../lib/api';
import { Trash2, Eye, Search } from 'lucide-react';

interface HallDashboardProps {
  onEditHall: (hall: Hall) => void;
}

export default function HallDashboard({ onEditHall }: HallDashboardProps) {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const data = await api.getHalls();
      setHalls(data || []);
    } catch (error) {
      console.error('Error fetching halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHall = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hall? All seat assignments will be lost.')) {
      return;
    }

    try {
      await api.deleteHall(id);
      setHalls(halls.filter((hall) => hall._id !== id));
    } catch (error) {
      console.error('Error deleting hall:', error);
    }
  };

  const filteredHalls = halls.filter((hall) =>
    hall.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading halls...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Exam Halls</h2>
        <p className="text-gray-600">Manage all your exam halls and seating arrangements</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search halls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filteredHalls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No halls found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Create your first hall to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall) => (
            <div
              key={hall._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{hall.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Layout:</span>
                  <span className="font-medium text-gray-800">
                    {hall.rows} × {hall.columns}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Seats/Bench:</span>
                  <span className="font-medium text-gray-800">{hall.seats_per_bench}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Seats:</span>
                  <span className="font-medium text-gray-800">
                    {hall.rows * hall.columns * hall.seats_per_bench}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEditHall(hall)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => deleteHall(hall._id)}
                  className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
