const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Hall {
  _id: string;
  name: string;
  rows: number;
  columns: number;
  seats_per_bench: number;
  created_at: string;
  updated_at: string;
}

export interface Seat {
  _id: string;
  hall_id: string;
  row_number: number;
  column_number: number;
  seat_number: number;
  register_number: string | null;
  student_name: string | null;
  department: string | null;
  semester: string | null;
  is_assigned: boolean;
}

export interface Student {
  _id: string;
  register_number: string;
  name: string;
  department: string;
  semester: string;
  class_section?: string;
}

export interface StudentInput {
  register_number: string;
  name: string;
  department: string;
  semester: string;
  class_section?: string;
}

export interface Department {
  _id: string;
  name: string;
  studentCount?: number;
}

class API {
  // Halls
  async getHalls(): Promise<Hall[]> {
    const response = await fetch(`${API_URL}/halls`);
    if (!response.ok) throw new Error('Failed to fetch halls');
    return response.json();
  }

  async createHall(data: {
    name: string;
    rows: number;
    columns: number;
    seats_per_bench: number;
  }): Promise<Hall> {
    const response = await fetch(`${API_URL}/halls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create hall');
    return response.json();
  }

  async deleteHall(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/halls/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete hall');
  }

  // Seats
  async getSeats(hallId: string): Promise<Seat[]> {
    const response = await fetch(`${API_URL}/halls/${hallId}/seats`);
    if (!response.ok) throw new Error('Failed to fetch seats');
    return response.json();
  }

  async updateSeats(hallId: string, seats: Seat[]): Promise<void> {
    const response = await fetch(`${API_URL}/halls/${hallId}/seats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seats }),
    });
    if (!response.ok) throw new Error('Failed to update seats');
  }

  async clearSeats(hallId: string): Promise<void> {
    const response = await fetch(`${API_URL}/halls/${hallId}/seats/clear`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to clear seats');
  }

  // Students
  async getStudents(): Promise<Student[]> {
    const response = await fetch(`${API_URL}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  }

  async addStudent(student: StudentInput): Promise<Student> {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (!response.ok) throw new Error('Failed to add student');
    return response.json();
  }

  async bulkAddStudents(students: StudentInput[]): Promise<Student[]> {
    const response = await fetch(`${API_URL}/students/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students }),
    });
    if (!response.ok) throw new Error('Failed to bulk add students');
    return response.json();
  }

  async deleteStudent(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete student');
  }

  async searchStudents(query: {
    department?: string;
    semester?: string;
  }): Promise<Student[]> {
    const params = new URLSearchParams();
    if (query.department) params.append('department', query.department);
    if (query.semester) params.append('semester', query.semester);
    
    const response = await fetch(`${API_URL}/students/search?${params}`);
    if (!response.ok) throw new Error('Failed to search students');
    return response.json();
  }

  async getStudentsBySemester(department: string, semester: string): Promise<Student[]> {
    const response = await fetch(
      `${API_URL}/students/semester?department=${encodeURIComponent(department)}&semester=${encodeURIComponent(semester)}`
    );
    if (!response.ok) throw new Error('Failed to fetch students by semester');
    return response.json();
  }

  // Department APIs
  async getDepartments(): Promise<Department[]> {
    const response = await fetch(`${API_URL}/departments`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    return response.json();
  }

  async addDepartment(name: string): Promise<Department> {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to add department');
    return response.json();
  }

  async deleteDepartment(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete department');
  }

  // Get student hall assignments
  async getStudentAssignments(department?: string, semester?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    
    const response = await fetch(`${API_URL}/students/assignments?${params}`);
    if (!response.ok) throw new Error('Failed to fetch student assignments');
    return response.json();
  }

  // Get assigned register numbers
  async getAssignedRegNos(): Promise<string[]> {
    const response = await fetch(`${API_URL}/students/assigned-regnos`);
    if (!response.ok) throw new Error('Failed to fetch assigned register numbers');
    return response.json();
  }
}

export const api = new API();
