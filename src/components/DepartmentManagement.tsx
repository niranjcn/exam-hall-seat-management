import { useEffect, useState } from 'react';
import { api, Department } from '../lib/api';
import { Building2, Plus, Trash2, ChevronRight, Download, Upload, X } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim()) {
      alert('Please enter a department name');
      return;
    }

    try {
      await api.addDepartment(newDepartmentName.trim());
      await fetchDepartments();
      setNewDepartmentName('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding department:', error);
      alert('Failed to add department');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure? This will delete all students in this department.')) {
      return;
    }

    try {
      await api.deleteDepartment(id);
      await fetchDepartments();
      if (selectedDepartment?._id === id) {
        setSelectedDepartment(null);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Department Management
          </h1>
          <p className="text-gray-600 mt-2">Organize students by department and year</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Departments</h2>
          {departments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No departments yet</p>
              <p className="text-sm mt-2">Click "Add Department" to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  className={`group flex items-center justify-between p-4 rounded-lg border-2 transition cursor-pointer ${
                    selectedDepartment?._id === dept._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDepartment(dept)}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800">{dept.name}</p>
                      <p className="text-xs text-gray-500">{dept.studentCount || 0} students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDepartment(dept._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Year Selection */}
        <div className="lg:col-span-2">
          {selectedDepartment ? (
            <YearView department={selectedDepartment} />
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Building2 className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Department</h3>
              <p className="text-gray-500">Choose a department from the list to manage students</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add New Department</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Computer Science"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDepartmentName('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function YearView({ department }: { department: Department }) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = [
    { year: 1, label: '1st Year', semesters: ['S1', 'S2'] },
    { year: 2, label: '2nd Year', semesters: ['S3', 'S4'] },
    { year: 3, label: '3rd Year', semesters: ['S5', 'S6'] },
    { year: 4, label: '4th Year', semesters: ['S7', 'S8'] },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{department.name}</h2>
      
      {selectedYear === null ? (
        <div className="grid grid-cols-2 gap-4">
          {years.map((yearData) => (
            <button
              key={yearData.year}
              onClick={() => setSelectedYear(yearData.year)}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">
                  {yearData.label}
                </h3>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <div className="flex gap-2">
                {yearData.semesters.map((sem) => (
                  <span
                    key={sem}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full group-hover:bg-blue-100 group-hover:text-blue-700"
                  >
                    {sem}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <SemesterView
          department={department}
          year={selectedYear}
          onBack={() => setSelectedYear(null)}
        />
      )}
    </div>
  );
}

function SemesterView({
  department,
  year,
  onBack,
}: {
  department: Department;
  year: number;
  onBack: () => void;
}) {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const semesters = year === 1 ? ['S1', 'S2'] : year === 2 ? ['S3', 'S4'] : year === 3 ? ['S5', 'S6'] : ['S7', 'S8'];

  if (selectedSemester) {
    return (
      <StudentList
        department={department}
        semester={selectedSemester}
        onBack={() => setSelectedSemester(null)}
      />
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Back to Years
      </button>
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Select Semester - Year {year}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {semesters.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className="group p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">
                {sem}
              </h4>
              <p className="text-sm text-gray-500 mt-2">Semester {sem.substring(1)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StudentList({
  department,
  semester,
  onBack,
}: {
  department: Department;
  semester: string;
  onBack: () => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [newStudent, setNewStudent] = useState({ name: '', register_number: '' });
  const [bulkData, setBulkData] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [department._id, semester]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudentsBySemester(department.name, semester);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.register_number.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      await api.addStudent({
        name: newStudent.name.trim(),
        register_number: newStudent.register_number.trim(),
        department: department.name,
        semester,
      });
      await fetchStudents();
      setNewStudent({ name: '', register_number: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Register number might already exist.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploadFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (typeof data === 'string') {
        setBulkData(data);
      }
    };

    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) {
      alert('Please paste CSV data');
      return;
    }

    try {
      const lines = bulkData.trim().split('\n');
      const studentsToAdd = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          studentsToAdd.push({
            name: parts[0],
            register_number: parts[1],
            department: department.name,
            semester,
          });
        }
      }

      if (studentsToAdd.length === 0) {
        alert('No valid student data found. Format: Name, Register Number');
        return;
      }

      await api.bulkAddStudents(studentsToAdd);
      await fetchStudents();
      setBulkData('');
      setShowBulkModal(false);
      alert(`Successfully added ${studentsToAdd.length} students`);
    } catch (error) {
      console.error('Error bulk uploading:', error);
      alert('Failed to upload students. Some register numbers might already exist.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Delete this student?')) return;

    try {
      await api.deleteStudent(id);
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleDownloadAssignments = async () => {
    try {
      const data = await api.getStudentAssignments(department.name, semester);
      
      if (data.length === 0) {
        alert('No hall assignments found for this semester');
        return;
      }

      setAssignments(data);
      setShowAssignmentsModal(true);
    } catch (error) {
      console.error('Error loading assignments:', error);
      alert('Failed to load hall assignments');
    }
  };

  const handleDownloadTableScreenshot = async () => {
    const tableElement = document.getElementById('assignments-table');
    if (!tableElement) return;

    try {
      const canvas = await html2canvas(tableElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${department.name}-${semester}-Hall-Assignments.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading screenshot:', error);
      alert('Failed to download screenshot');
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Back to Semesters
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {department.name} - {semester}
          </h3>
          <p className="text-gray-600 mt-1">{students.length} students enrolled</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadAssignments}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <Download className="w-4 h-4" />
            Hall Assignments
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      {students.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-500">No students in this semester</p>
          <p className="text-sm text-gray-400 mt-2">Add students manually or use bulk upload</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Register Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {student.register_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteStudent(student._id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
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
                  Register Number *
                </label>
                <input
                  type="text"
                  value={newStudent.register_number}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, register_number: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 22CS001"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Department:</strong> {department.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Semester:</strong> {semester}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewStudent({ name: '', register_number: '' });
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Bulk Upload Students</h3>
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">CSV Format:</p>
              <p className="text-xs text-yellow-700 font-mono">
                Name, Register Number
              </p>
              <p className="text-xs text-yellow-700 mt-2">Example:</p>
              <p className="text-xs text-yellow-700 font-mono">
                John Doe, 22CS001<br />
                Jane Smith, 22CS002<br />
                Mike Johnson, 22CS003
              </p>
            </div>
            <div className="space-y-4">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV file (.csv)</p>
                      {uploadFile && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          Selected: {uploadFile.name}
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm text-gray-500 font-medium">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste CSV Data
                </label>
                <textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                  rows={10}
                  placeholder="John Doe, 22CS001&#10;Jane Smith, 22CS002&#10;Mike Johnson, 22CS003"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  All students will be added to: <strong>{department.name} - {semester}</strong>
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkData('');
                  setUploadFile(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Upload Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hall Assignments Modal */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Hall Assignments</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {department.name} - {semester} ({assignments.length} students assigned)
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div id="assignments-table" className="bg-white">
                <div className="mb-4 text-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Hall Assignments - {department.name}
                  </h2>
                  <p className="text-sm text-gray-600">Semester: {semester}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Generated on: {new Date().toLocaleString()}
                  </p>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        Register Number
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        Student Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        Hall Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        Seat Position
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {assignment.register_number}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {assignment.student_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {assignment.hall_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {assignment.seat_info}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownloadTableScreenshot}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                Download Screenshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
