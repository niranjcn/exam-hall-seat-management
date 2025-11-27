import { useState } from 'react';
import { api, Hall } from '../lib/api';
import { Save } from 'lucide-react';

interface CreateHallFormProps {
  onHallCreated: (hall: Hall) => void;
}

export default function CreateHallForm({ onHallCreated }: CreateHallFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    rows: 5,
    columns: 5,
    seats_per_bench: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const hallData = await api.createHall({
        name: formData.name,
        rows: formData.rows,
        columns: formData.columns,
        seats_per_bench: formData.seats_per_bench,
      });

      setFormData({ name: '', rows: 5, columns: 5, seats_per_bench: 2 });
      onHallCreated(hallData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create hall');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Hall</h2>
        <p className="text-gray-600">Set up a new exam hall with custom seating layout</p>
      </div>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hall Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., CSE Block – Hall 101"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rows
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Columns
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.columns}
                onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seats per Bench
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.seats_per_bench}
                onChange={(e) =>
                  setFormData({ ...formData, seats_per_bench: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Total Seats:</strong>{' '}
              {formData.rows * formData.columns * formData.seats_per_bench}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Layout:</strong> {formData.rows} rows × {formData.columns} columns × {formData.seats_per_bench} seats
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Hall'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
