import { useState } from 'react';
import { api } from '../lib/api';
import { Save, X, Upload, Download, UserPlus, Trash2 } from 'lucide-react';

export interface Student {
  _id?: string;
  register_number: string;
  name: string;
  department: string;
  semester: string;
  class_section?: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [newStudent, setNewStudent] = useState<Student>({
    register_number: '',
    name: '',
    department: '',
    semester: '',
    class_section: '',
  });
  const [bulkData, setBulkData] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleAddStudent = async () => {
    if (!newStudent.register_number || !newStudent.name || !newStudent.department || !newStudent.semester) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const added = await api.addStudent(newStudent);
      setStudents([...students, added]);
      setNewStudent({
        register_number: '',
        name: '',
        department: '',
        semester: '',
        class_section: '',
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await api.deleteStudent(id);
      setStudents(students.filter((s) => s._id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleBulkImport = async () => {
    try {
      const lines = bulkData.trim().split('\n');
      const studentsToAdd: Student[] = [];

      for (const line of lines) {
        const [regNo, name, dept, sem, section] = line.split(',').map((s) => s.trim());
        if (regNo && name && dept && sem) {
          studentsToAdd.push({
            register_number: regNo,
            name,
            department: dept,
            semester: sem,
            class_section: section || '',
          });
        }
      }

      const added = await api.bulkAddStudents(studentsToAdd);
      setStudents([...students, ...added]);
      setBulkData('');
      setShowBulkModal(false);
      alert(`Successfully added ${added.length} students`);
    } catch (error) {
      console.error('Error bulk importing:', error);
      alert('Failed to import students');
    }
  };

  const exportStudents = () => {
    const csv = [
      ['Register Number', 'Name', 'Department', 'Semester', 'Section'],
      ...students.map((s) => [
        s.register_number,
        s.name,
        s.department,
        s.semester,
        s.class_section || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter((s) => {
    if (filterDept && s.department !== filterDept) return false;
    if (filterSem && s.semester !== filterSem) return false;
    return true;
  });

  const departments = Array.from(new Set(students.map((s) => s.department)));
  const semesters = Array.from(new Set(students.map((s) => s.semester)));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Management</h2>
        <p className="text-gray-600">Manage student database for easy seat assignments</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex items-center space-x-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
        <button
          onClick={() => setShowBulkModal(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Upload className="w-4 h-4" />
          <span>Bulk Import</span>
        </button>
        <button
          onClick={exportStudents}
          disabled={students.length === 0}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select
          value={filterSem}
          onChange={(e) => setFilterSem(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Register No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.register_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {student.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {student.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {student.class_section || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => student._id && handleDeleteStudent(student._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No students found. Add students to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Student</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Register Number *
                </label>
                <input
                  type="text"
                  value={newStudent.register_number}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, register_number: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 23CSE001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                <input
                  type="text"
                  value={newStudent.semester}
                  onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Semester 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section (Optional)
                </label>
                <input
                  type="text"
                  value={newStudent.class_section}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, class_section: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., A"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Bulk Import Students</h3>
            <p className="text-gray-600 mb-6">
              Enter student data in CSV format (one per line):
              <br />
              <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                RegisterNo, Name, Department, Semester, Section
              </code>
            </p>

            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              placeholder="23CSE001, John Doe, Computer Science, Semester 5, A&#10;23CSE002, Jane Smith, Computer Science, Semester 5, A&#10;23ECE001, Bob Johnson, Electronics, Semester 3, B"
            />

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkData('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition"
              >
                <Upload className="w-4 h-4" />
                <span>Import Students</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
