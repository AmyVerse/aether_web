# Hybrid Timetable Management Workflow

## 🏗️ **Different Workflows for Classrooms vs Labs**

### **CLASSROOM WORKFLOW (2-Step Process):**

#### **STEP 1: Classroom Allocation**

_Editor allocates classrooms to branch+section+semester with day_half restrictions_

```
| Branch+Section | First Half (8AM-1PM) | Second Half (1PM-6PM) |
|----------------|---------------------|----------------------|
| CSE-A-1        | HALL-1             | [Select Room]        |
| CSE-B-1        | [Select Room]      | HALL-1               |
```

**Database:** `classroomAllocations` table

- `day_half` = "first_half" or "second_half" (required)
- Creates allocation record first

#### **STEP 2: Subject Scheduling in Allocated Classrooms**

_Editor fills subjects in the pre-allocated classroom grids_

**Database:** `timetableEntries` table

- `allocation_id` = reference to classroom allocation (required)
- `room_id` = null (inherited from allocation)
- Limited to allocated day_half time slots

### **LAB WORKFLOW (Direct Scheduling):**

#### **Direct Lab Scheduling**

_Editor directly schedules: Lab + Branch + Semester + Section + Subject_

```
Lab Scheduling Interface:
- Select Lab: "VLSI Lab"
- Academic Context: ECE-VII-A (2025-26, Odd)
- Subject: "VLSI Design Lab"
- Day/Time: Monday 9:00-9:55
```

**Database:** `timetableEntries` table

- `allocation_id` = null (no pre-allocation needed)
- `room_id` = direct lab reference (required)
- `academic_year`, `semester_type`, `semester`, `branch`, `section` = direct values
- Can use any time slot (8AM-6PM)

## 🔄 **Data Examples**

### **Classroom Entry:**

```sql
-- Step 1: Allocate classroom
INSERT INTO classroom_allocations (
  academic_year, semester_type, semester, branch, section,
  room_id, day_half
) VALUES (
  '2025-2026', 'odd', 1, 'CSE', 'A',
  'hall-1-uuid', 'first_half'
);

-- Step 2: Schedule subject in allocated classroom
INSERT INTO timetable_entries (
  allocation_id, subject_id, day, time_slot
) VALUES (
  'allocation-uuid', 'math-subject-uuid', 'Monday', '9:00-9:55'
);
```

### **Lab Entry (Direct):**

```sql
-- Direct lab scheduling (no allocation step)
INSERT INTO timetable_entries (
  room_id, academic_year, semester_type, semester, branch, section,
  subject_id, day, time_slot, notes
) VALUES (
  'vlsi-lab-uuid', '2025-2026', 'odd', 7, 'ECE', 'A',
  'vlsi-subject-uuid', 'Monday', '9:00-9:55', 'VLSI Lab Session'
);
```

### **STEP 3: Teacher Assignment**

_Admin assigns teachers to specific subjects/labs_

**Single System:** Same `classTeachers` table

- Works for both regular subjects and lab sessions
- Teacher gets assigned to specific `timetable_entry_id`

### **STEP 4: Student Enrollment**

_Students enrolled to teacher classes/labs_

**Single System:** Same `classStudents` table

- Works for both regular classes and lab sessions
- Student gets enrolled to specific `teacher_class_id`

## 🔄 **Data Flow**

### **For Teachers:**

```sql
-- Get teacher's classes (current approach works)
SELECT
  ca.academic_year, ca.semester_type, ca.semester,
  ca.branch, ca.section, ca.day_half,
  r.room_number,
  -- Get all timetable entries for this allocation
  te.day, te.time_slot, s.course_name
FROM class_teachers ct
JOIN classroom_allocations ca ON ct.allocation_id = ca.id
JOIN rooms r ON ca.room_id = r.id
LEFT JOIN timetable_entries te ON te.allocation_id = ca.id
LEFT JOIN subjects s ON te.subject_id = s.id
WHERE ct.teacher_id = ?
```

### **For Students:**

```sql
-- Get student's timetable
SELECT
  ca.day_half, r.room_number,
  te.day, te.time_slot, s.course_name
FROM classroom_allocations ca
JOIN rooms r ON ca.room_id = r.id
JOIN timetable_entries te ON te.allocation_id = ca.id
JOIN subjects s ON te.subject_id = s.id
WHERE ca.academic_year = ?
  AND ca.semester_type = ?
  AND ca.semester = ?
  AND ca.branch = ?
  AND ca.section = ?
```

## 🎯 **Benefits**

1. **Simplified Editor Workflow:**

   - First allocate rooms (one-time setup)
   - Then just fill subjects in grids

2. **Clear Data Separation:**

   - `classroomAllocations` = WHO gets WHICH room WHEN
   - `timetableEntries` = WHAT subject is taught in each slot

3. **Flexibility:**

   - Easy to reassign rooms without affecting timetable
   - Support for half-day allocations (as per your CSV)
   - Clear academic session management

4. **Performance:**
   - Fewer joins needed
   - Clear indexing strategy
   - Efficient queries for both teachers and students

## 📱 **UI Components Needed**

1. **ClassroomAllocationGrid** - Step 1 interface
2. **SubjectTimetableGrid** - Step 2 interface
3. **AllocationSelector** - Choose which allocation to edit
4. **TimetableViewer** - View complete timetables (teacher/student)

This matches exactly with your CSV structure and provides a much more intuitive workflow for editors!
