import { useEffect, useState, useRef } from 'react';
import { api, Hall, Seat as SeatType, Student } from '../lib/api';
import Seat from './Seat';
import { ArrowLeft, Save, Printer, RefreshCw, Edit3, ArrowRight, ArrowDown, Users, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

type SelectionSequence = 'horizontal' | 'vertical';

interface HallLayoutProps {
  hall: Hall;
  onBack: () => void;
}

export default function HallLayout({ hall, onBack }: HallLayoutProps) {
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectionSequence, setSelectionSequence] = useState<SelectionSequence>('horizontal');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [useStudentDb, setUseStudentDb] = useState(false);
  const [assignedRegNos, setAssignedRegNos] = useState<string[]>([]);
  const [studentRange, setStudentRange] = useState({ start: 1, end: 10 });
  const [assignmentData, setAssignmentData] = useState({
    startingRegNo: '',
    studentName: '',
    department: '',
    semester: '',
  });
  const hallLayoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSeats();
    fetchStudents();
    fetchAssignedRegNos();
  }, [hall._id]);

  const fetchAssignedRegNos = async () => {
    try {
      const regnos = await api.getAssignedRegNos();
      setAssignedRegNos(regnos);
    } catch (error) {
      console.error('Error fetching assigned register numbers:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSeats = async () => {
    try {
      const data = await api.getSeats(hall._id);
      setSeats(data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat: SeatType) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.find((s) => s._id === seat._id);
      if (isSelected) {
        return prev.filter((s) => s._id !== seat._id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleAssignSeats = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select seats');
      return;
    }

    if (useStudentDb) {
      // Assign from student database
      const studentsToAssign = filteredStudents.slice(studentRange.start - 1, studentRange.end);
      
      if (studentsToAssign.length < selectedSeats.length) {
        if (!confirm(`Only ${studentsToAssign.length} students in range for ${selectedSeats.length} seats. Continue?`)) {
          return;
        }
      }

      try {
        // Sort selected seats based on sequence
        const sortedSeats = [...selectedSeats].sort((a, b) => {
          if (selectionSequence === 'horizontal') {
            if (a.row_number !== b.row_number) return a.row_number - b.row_number;
            if (a.column_number !== b.column_number) return a.column_number - b.column_number;
            return a.seat_number - b.seat_number;
          } else {
            if (a.column_number !== b.column_number) return a.column_number - b.column_number;
            if (a.row_number !== b.row_number) return a.row_number - b.row_number;
            return a.seat_number - b.seat_number;
          }
        });

        const updates = sortedSeats.map((seat, index) => {
          const student = studentsToAssign[index];
          if (!student) {
            return {
              ...seat,
              is_assigned: false,
            };
          }

          return {
            ...seat,
            register_number: student.register_number,
            student_name: student.name,
            department: student.department,
            semester: student.semester,
            is_assigned: true,
          };
        });

        await api.updateSeats(hall._id, updates);
        await fetchSeats();
        await fetchAssignedRegNos(); // Refresh assigned list
        setSelectedSeats([]);
        setShowAssignModal(false);
        setUseStudentDb(false);
        setFilteredStudents([]);
      } catch (error) {
        console.error('Error assigning seats:', error);
        alert('Failed to assign seats');
      }
    } else {
      // Manual assignment
      if (!assignmentData.startingRegNo) {
        alert('Please enter a starting register number');
        return;
      }

      try {
        // Sort selected seats based on sequence
        const sortedSeats = [...selectedSeats].sort((a, b) => {
          if (selectionSequence === 'horizontal') {
            if (a.row_number !== b.row_number) return a.row_number - b.row_number;
            if (a.column_number !== b.column_number) return a.column_number - b.column_number;
            return a.seat_number - b.seat_number;
          } else {
            if (a.column_number !== b.column_number) return a.column_number - b.column_number;
            if (a.row_number !== b.row_number) return a.row_number - b.row_number;
            return a.seat_number - b.seat_number;
          }
        });

        const updates = sortedSeats.map((seat, index) => {
          const regNo = assignmentData.startingRegNo.replace(/\d+$/, (match) => {
            const num = parseInt(match) + index;
            return num.toString().padStart(match.length, '0');
          });

          return {
            ...seat,
            register_number: regNo,
            student_name: assignmentData.studentName || null,
            department: assignmentData.department || null,
            semester: assignmentData.semester || null,
            is_assigned: true,
          };
        });

        await api.updateSeats(hall._id, updates);
        await fetchSeats();
        setSelectedSeats([]);
        setShowAssignModal(false);
        setAssignmentData({ startingRegNo: '', studentName: '', department: '', semester: '' });
      } catch (error) {
        console.error('Error assigning seats:', error);
        alert('Failed to assign seats');
      }
    }
  };

  const handleFilterStudents = (dept: string, sem: string) => {
    const filtered = students.filter((s) => {
      if (dept && s.department !== dept) return false;
      if (sem && s.semester !== sem) return false;
      // Exclude already assigned students
      if (assignedRegNos.includes(s.register_number)) return false;
      return true;
    });
    
    // Sort students alphabetically by register number
    filtered.sort((a, b) => a.register_number.localeCompare(b.register_number));
    
    setFilteredStudents(filtered);
    // Reset range to match available students
    if (filtered.length > 0) {
      setStudentRange({ 
        start: 1, 
        end: Math.min(selectedSeats.length, filtered.length) 
      });
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all seat assignments?')) {
      return;
    }

    try {
      await api.clearSeats(hall._id);
      await fetchSeats();
      setSelectedSeats([]);
    } catch (error) {
      console.error('Error clearing seats:', error);
    }
  };

  const handleClearSeat = async (seat: SeatType) => {
    if (!confirm(`Clear seat R${seat.row_number}C${seat.column_number}S${seat.seat_number}?`)) {
      return;
    }

    try {
      const clearedSeat = {
        ...seat,
        register_number: null,
        student_name: null,
        department: null,
        semester: null,
        is_assigned: false,
      };
      await api.updateSeats(hall._id, [clearedSeat]);
      await fetchSeats();
    } catch (error) {
      console.error('Error clearing seat:', error);
      alert('Failed to clear seat');
    }
  };

  const handleDownloadScreenshot = async () => {
    if (!hallLayoutRef.current) return;

    try {
      const canvas = await html2canvas(hallLayoutRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${hall.name}-seating-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating screenshot:', error);
      alert('Failed to download screenshot');
    }
  };

  const handlePrint = () => {
    window.print();
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

  const renderLayout = () => {
    const benches = groupSeatsByBench();
    const rows: JSX.Element[] = [];

    for (let row = 1; row <= hall.rows; row++) {
      const columns: JSX.Element[] = [];

      for (let col = 1; col <= hall.columns; col++) {
        const benchSeats = benches[`${row}-${col}`] || [];
        benchSeats.sort((a, b) => a.seat_number - b.seat_number);

        columns.push(
          <div key={`${row}-${col}`} className="flex items-center space-x-1 p-2 bg-gray-50 rounded-lg">
            {benchSeats.map((seat) => (
              <Seat
                key={seat._id}
                seat={seat}
                isSelected={!!selectedSeats.find((s) => s._id === seat._id)}
                onSelect={handleSeatSelect}
                onClear={handleClearSeat}
              />
            ))}
          </div>
        );
      }

      rows.push(
        <div key={row} className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-sm font-semibold text-gray-600 w-8">R{row}</div>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-around gap-4">{columns}</div>
          </div>
        </div>
      );
    }

    return rows;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading hall layout...</div>
      </div>
    );
  }

  return (
    <div className="p-8 screen-only">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{hall.name}</h2>
            <p className="text-gray-600">
              {hall.rows} × {hall.columns} layout with {hall.seats_per_bench}-seater benches
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {selectedSeats.length > 0 && (
            <>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setSelectionSequence('horizontal')}
                  className={`flex items-center space-x-1 px-3 py-2 transition ${
                    selectionSequence === 'horizontal'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Horizontal sequence (row by row)"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm">Horizontal</span>
                </button>
                <button
                  onClick={() => setSelectionSequence('vertical')}
                  className={`flex items-center space-x-1 px-3 py-2 transition ${
                    selectionSequence === 'vertical'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Vertical sequence (column by column)"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-sm">Vertical</span>
                </button>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>Assign ({selectedSeats.length})</span>
              </button>
            </>
          )}
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear All</span>
          </button>
          <button
            onClick={handleDownloadScreenshot}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center space-x-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">Empty</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded"></div>
          <span className="text-sm text-gray-600">Assigned</span>
        </div>
      </div>

      {/* Classroom View with Blackboard */}
      <div ref={hallLayoutRef} className="bg-gradient-to-b from-gray-100 to-gray-200 p-8 rounded-xl border-2 border-gray-300 shadow-inner">
        {/* Blackboard at the front */}
        <div className="mb-8 bg-gradient-to-b from-green-800 to-green-900 rounded-lg shadow-lg border-4 border-yellow-900 p-6">
          <div className="border-2 border-yellow-800 rounded p-4">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-yellow-100 mb-2 font-serif" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {hall.name}
              </h3>
              <div className="flex justify-center items-center space-x-8 mt-4">
                <div className="text-yellow-100">
                  <span className="text-sm opacity-80">Layout:</span>
                  <span className="ml-2 font-semibold">{hall.rows} × {hall.columns}</span>
                </div>
                <div className="text-yellow-100">
                  <span className="text-sm opacity-80">Capacity:</span>
                  <span className="ml-2 font-semibold">{hall.rows * hall.columns * hall.seats_per_bench} seats</span>
                </div>
                <div className="text-yellow-100">
                  <span className="text-sm opacity-80">Seats/Bench:</span>
                  <span className="ml-2 font-semibold">{hall.seats_per_bench}</span>
                </div>
              </div>
            </div>
            {/* Chalk holder simulation */}
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-16 h-2 bg-white rounded-full opacity-70"></div>
              <div className="w-16 h-2 bg-yellow-200 rounded-full opacity-70"></div>
              <div className="w-16 h-2 bg-blue-200 rounded-full opacity-70"></div>
            </div>
          </div>
        </div>

        {/* Teacher's Desk */}
        <div className="mb-6 flex justify-center">
          <div className="bg-yellow-800 border-4 border-yellow-900 rounded-lg shadow-lg px-12 py-3">
            <p className="text-white font-semibold text-sm">Teacher's Desk</p>
          </div>
        </div>

        {/* Seating Area */}
        <div className="bg-white bg-opacity-50 p-6 rounded-xl border border-gray-300 backdrop-blur-sm">
          {renderLayout()}
        </div>

        {/* Floor indicator */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <div className="inline-flex items-center space-x-2">
            <div className="w-8 h-1 bg-gray-400"></div>
            <span>Back of Classroom</span>
            <div className="w-8 h-1 bg-gray-400"></div>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Assign Seats</h3>
              <p className="text-gray-600 mt-2">
                Assigning {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Toggle between manual and student DB */}
              <div className="mb-6 flex gap-2">
                <button
                  onClick={() => {
                    setUseStudentDb(false);
                    setFilteredStudents([]);
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                    !useStudentDb
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Manual Entry
                </button>
                <button
                  onClick={() => setUseStudentDb(true)}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                    useStudentDb
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Student Database
                </button>
              </div>

              {useStudentDb ? (
                /* Student Database Mode */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Department
                    </label>
                    <select
                      onChange={(e) => {
                        const dept = e.target.value;
                        const sem = (document.getElementById('sem-filter') as HTMLSelectElement)?.value || '';
                        handleFilterStudents(dept, sem);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">All Departments</option>
                      {[...new Set(students.map(s => s.department))].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Semester
                    </label>
                    <select
                      id="sem-filter"
                      onChange={(e) => {
                        const sem = e.target.value;
                        const dept = (document.querySelector('select') as HTMLSelectElement)?.value || '';
                        handleFilterStudents(dept, sem);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">All Semesters</option>
                      {[...new Set(students.map(s => s.semester))].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="font-semibold text-blue-900">
                      {filteredStudents.length > 0
                        ? `${filteredStudents.length} unassigned students found`
                        : 'Select filters to view students'}
                    </p>
                    {filteredStudents.length > 0 && (
                      <p className="text-blue-700 mt-1">
                        {selectedSeats.length} seats selected
                      </p>
                    )}
                  </div>
                  {filteredStudents.length > 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Student #
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={filteredStudents.length}
                            value={studentRange.start}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setStudentRange({ ...studentRange, start: Math.max(1, val) });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To Student #
                        </label>
                        <input
                          type="number"
                          min={studentRange.start}
                          max={filteredStudents.length}
                          value={studentRange.end}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setStudentRange({ ...studentRange, end: Math.min(filteredStudents.length, val) });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-green-900">
                        Assigning students {studentRange.start} to {studentRange.end} ({studentRange.end - studentRange.start + 1} students)
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs text-gray-600 font-medium mb-2">Students to be assigned:</p>
                      {filteredStudents.slice(studentRange.start - 1, studentRange.end).map((student, idx) => (
                        <div key={student._id} className="text-sm py-2 px-3 bg-white rounded-md mb-2 shadow-sm">
                          <span className="font-semibold text-blue-600">{studentRange.start + idx}.</span> {student.register_number} - {student.name}
                          <div className="text-xs text-gray-500 mt-1">{student.department} • {student.semester}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Manual Entry Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Register Number
                  </label>
                  <input
                    type="text"
                    value={assignmentData.startingRegNo}
                    onChange={(e) =>
                      setAssignmentData({ ...assignmentData, startingRegNo: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 23001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={assignmentData.studentName}
                    onChange={(e) =>
                      setAssignmentData({ ...assignmentData, studentName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={assignmentData.department}
                    onChange={(e) =>
                      setAssignmentData({ ...assignmentData, department: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester (Optional)
                  </label>
                  <input
                    type="text"
                    value={assignmentData.semester}
                    onChange={(e) =>
                      setAssignmentData({ ...assignmentData, semester: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Semester 5"
                  />
                </div>
              </div>
            )}
            </div>

            {/* Fixed Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setUseStudentDb(false);
                    setFilteredStudents([]);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSeats}
                  disabled={
                    useStudentDb
                      ? filteredStudents.length === 0
                      : !assignmentData.startingRegNo
                  }
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>Assign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
