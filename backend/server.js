const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:examhall123@localhost:27017/examhall?authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schemas
const hallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  seats_per_bench: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const seatSchema = new mongoose.Schema({
  hall_id: { type: String, required: true },
  row_number: { type: Number, required: true },
  column_number: { type: Number, required: true },
  seat_number: { type: Number, required: true },
  register_number: { type: String, default: null },
  student_name: { type: String, default: null },
  department: { type: String, default: null },
  semester: { type: String, default: null },
  is_assigned: { type: Boolean, default: false }
});

const studentSchema = new mongoose.Schema({
  register_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  class_section: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now }
});

const Hall = mongoose.model('Hall', hallSchema);
const Seat = mongoose.model('Seat', seatSchema);
const Student = mongoose.model('Student', studentSchema);
const Department = mongoose.model('Department', departmentSchema);

// Routes

// Get all halls
app.get('/api/halls', async (req, res) => {
  try {
    const halls = await Hall.find().sort({ created_at: -1 });
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new hall
app.post('/api/halls', async (req, res) => {
  try {
    const { name, rows, columns, seats_per_bench } = req.body;
    
    const hall = new Hall({ name, rows, columns, seats_per_bench });
    await hall.save();

    // Create seats for the hall
    const seats = [];
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        for (let seat = 1; seat <= seats_per_bench; seat++) {
          seats.push({
            hall_id: hall._id.toString(),
            row_number: row,
            column_number: col,
            seat_number: seat,
            is_assigned: false
          });
        }
      }
    }

    await Seat.insertMany(seats);

    res.status(201).json(hall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a hall
app.delete('/api/halls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Hall.findByIdAndDelete(id);
    await Seat.deleteMany({ hall_id: id });
    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seats for a hall
app.get('/api/halls/:id/seats', async (req, res) => {
  try {
    const { id } = req.params;
    const seats = await Seat.find({ hall_id: id })
      .sort({ row_number: 1, column_number: 1, seat_number: 1 });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update seats (bulk update)
app.put('/api/halls/:id/seats', async (req, res) => {
  try {
    const { id } = req.params;
    const { seats } = req.body;

    // Update each seat
    const updatePromises = seats.map(seat =>
      Seat.findByIdAndUpdate(seat._id, seat, { new: true })
    );

    await Promise.all(updatePromises);

    // Update hall's updated_at timestamp
    await Hall.findByIdAndUpdate(id, { updated_at: Date.now() });

    res.json({ message: 'Seats updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all seat assignments for a hall
app.post('/api/halls/:id/seats/clear', async (req, res) => {
  try {
    const { id } = req.params;
    await Seat.updateMany(
      { hall_id: id },
      {
        register_number: null,
        student_name: null,
        department: null,
        semester: null,
        is_assigned: false
      }
    );
    await Hall.findByIdAndUpdate(id, { updated_at: Date.now() });
    res.json({ message: 'Seats cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Student Routes

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ created_at: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search students
app.get('/api/students/search', async (req, res) => {
  try {
    const { department, semester } = req.query;
    const query = {};
    
    if (department) query.department = department;
    if (semester) query.semester = semester;
    
    const students = await Student.find(query).sort({ register_number: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students by semester
app.get('/api/students/semester', async (req, res) => {
  try {
    const { department, semester } = req.query;
    const students = await Student.find({ department, semester }).sort({ register_number: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a student
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Student with this register number already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Bulk add students
app.post('/api/students/bulk', async (req, res) => {
  try {
    const { students } = req.body;
    const inserted = await Student.insertMany(students, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.code === 11000) {
      // Some duplicates, but others may have been inserted
      res.status(207).json({ 
        error: 'Some students already exist',
        inserted: error.insertedDocs || []
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Student.findByIdAndDelete(id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Department Routes

// Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    // Get student count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const count = await Student.countDocuments({ department: dept.name });
        return {
          _id: dept._id,
          name: dept.name,
          studentCount: count,
        };
      })
    );
    
    res.json(departmentsWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a department
app.post('/api/departments', async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Department already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete a department
app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Delete all students in this department
    await Student.deleteMany({ department: department.name });
    
    // Delete the department
    await Department.findByIdAndDelete(id);
    
    res.json({ message: 'Department and all its students deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students with their hall assignments
app.get('/api/students/assignments', async (req, res) => {
  try {
    const { department, semester } = req.query;
    
    // Get all assigned seats
    const seats = await Seat.find({ 
      is_assigned: true,
      ...(department && { department }),
      ...(semester && { semester })
    });

    // Get hall information for each seat
    const hallIds = [...new Set(seats.map(s => s.hall_id))];
    const halls = await Hall.find({ _id: { $in: hallIds } });
    const hallMap = {};
    halls.forEach(h => hallMap[h._id.toString()] = h.name);

    // Create assignment list
    const assignments = seats.map(seat => ({
      register_number: seat.register_number,
      student_name: seat.student_name,
      department: seat.department,
      semester: seat.semester,
      hall_name: hallMap[seat.hall_id] || 'Unknown',
      seat_info: `R${seat.row_number}C${seat.column_number}S${seat.seat_number}`
    }));

    // Sort by register number
    assignments.sort((a, b) => {
      if (a.register_number && b.register_number) {
        return a.register_number.localeCompare(b.register_number);
      }
      return 0;
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all assigned register numbers (to exclude from available students)
app.get('/api/students/assigned-regnos', async (req, res) => {
  try {
    const assignedSeats = await Seat.find({ 
      is_assigned: true, 
      register_number: { $ne: null } 
    }).select('register_number');
    
    const regnos = assignedSeats.map(s => s.register_number);
    res.json(regnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
