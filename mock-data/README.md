# Mock Data for Bulk Upload

This folder contains sample CSV files for testing the bulk upload functionality in the Exam Hall Management System.

## Files Included

1. **CS-students.csv** - 69 Computer Science students (STM22CS001 to STM22CS069)
2. **CE-students.csv** - 69 Civil Engineering students (STM22CE001 to STM22CE069)
3. **CD-students.csv** - 69 Computer Science and Design students (STM22CD001 to STM22CD069)
4. **ME-students.csv** - 69 Mechanical Engineering students (STM22ME001 to STM22ME069)
5. **ECE-students.csv** - 69 Electronics and Communication students (STM22EC001 to STM22EC069)

## CSV Format

Each CSV file follows this format:
```
register_number,name,department,semester
STM22CS001,Student Name,Department Name,S5
```

## How to Use

1. Go to the **Departments** page in the application
2. Select a department
3. Navigate to the semester (e.g., S5)
4. Click on the **Upload** button (upload icon)
5. Select the corresponding CSV file for that department
6. The system will import all students from the CSV file

## Notes

- All students are assigned to **Semester 5 (S5)**
- Total students across all departments: **345 students**
- Each department has exactly **69 students**
- Register numbers follow the pattern: STM22[DEPT][001-069]
  - CS = Computer Science
  - CE = Civil Engineering
  - CD = Computer Science and Design
  - ME = Mechanical Engineering
  - EC = Electronics and Communication

## Testing Scenarios

You can use these files to test:
- Bulk student upload
- Hall assignment with multiple departments
- Seating arrangement with mixed departments
- Print and download functionality with real data
- Student management features
