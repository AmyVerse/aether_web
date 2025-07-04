# Demo Data Generation for College Timetable System

This file contains SQL commands to populate your database with realistic demo data for testing the college timetable system.

## Database Structure Overview

- **Subjects**: Courses with semester, course_code, course_name
- **Rooms**: Classrooms and Labs with room_number, room_type
- **Timetable Entries**: Each cell in the timetable (room × day × time slot)

## Step 1: Insert Demo Subjects (Courses)

```sql
-- Insert demo subjects for different semesters and branches
INSERT INTO subjects (id, semester, course_code, course_name, short_name, subject_type, credits, theory_hours, lab_hours, is_active) VALUES
-- Semester 1 (Odd)
('01234567-89ab-cdef-0123-456789abcdef', 1, 'CS101', 'Programming Fundamentals', 'PF', 'CSE', 4, 3, 1, true),
('11234567-89ab-cdef-0123-456789abcdef', 1, 'MA101', 'Engineering Mathematics I', 'EM1', 'BS', 4, 4, 0, true),
('21234567-89ab-cdef-0123-456789abcdef', 1, 'PH101', 'Physics I', 'PHY1', 'BS', 3, 2, 1, true),
('31234567-89ab-cdef-0123-456789abcdef', 1, 'EG101', 'Engineering Graphics', 'EG', 'BS', 2, 1, 1, true),
('41234567-89ab-cdef-0123-456789abcdef', 1, 'EN101', 'English Communication', 'ENG', 'HU', 3, 3, 0, true),

-- Semester 2 (Even)
('51234567-89ab-cdef-0123-456789abcdef', 2, 'CS102', 'Data Structures', 'DS', 'CSE', 4, 3, 1, true),
('61234567-89ab-cdef-0123-456789abcdef', 2, 'MA102', 'Engineering Mathematics II', 'EM2', 'BS', 4, 4, 0, true),
('71234567-89ab-cdef-0123-456789abcdef', 2, 'CH101', 'Chemistry', 'CHEM', 'BS', 3, 2, 1, true),
('81234567-89ab-cdef-0123-456789abcdef', 2, 'CS103', 'Digital Logic Design', 'DLD', 'CSE', 3, 2, 1, true),
('91234567-89ab-cdef-0123-456789abcdef', 2, 'EN102', 'Technical Writing', 'TW', 'HU', 2, 2, 0, true),

-- Semester 3 (Odd)
('a1234567-89ab-cdef-0123-456789abcdef', 3, 'CS201', 'Object Oriented Programming', 'OOP', 'CSE', 4, 3, 1, true),
('b1234567-89ab-cdef-0123-456789abcdef', 3, 'CS202', 'Computer Organization', 'CO', 'CSE', 3, 3, 0, true),
('c1234567-89ab-cdef-0123-456789abcdef', 3, 'MA201', 'Discrete Mathematics', 'DM', 'BS', 3, 3, 0, true),
('d1234567-89ab-cdef-0123-456789abcdef', 3, 'EC201', 'Digital Electronics', 'DE', 'ECE', 3, 2, 1, true),
('e1234567-89ab-cdef-0123-456789abcdef', 3, 'HU201', 'Economics', 'ECO', 'HU', 2, 2, 0, true),

-- Semester 4 (Even)
('f1234567-89ab-cdef-0123-456789abcdef', 4, 'CS301', 'Database Management Systems', 'DBMS', 'CSE', 4, 3, 1, true),
('01234567-89ab-cdef-0123-456789abcde1', 4, 'CS302', 'Computer Networks', 'CN', 'CSE', 4, 3, 1, true),
('11234567-89ab-cdef-0123-456789abcde1', 4, 'CS303', 'Operating Systems', 'OS', 'CSE', 4, 3, 1, true),
('21234567-89ab-cdef-0123-456789abcde1', 4, 'MA301', 'Probability & Statistics', 'PS', 'BS', 3, 3, 0, true),
('31234567-89ab-cdef-0123-456789abcde1', 4, 'CS304', 'Software Engineering', 'SE', 'CSE', 3, 3, 0, true),

-- Semester 5 (Odd) - CSE Specializations
('41234567-89ab-cdef-0123-456789abcde1', 5, 'AI501', 'Machine Learning', 'ML', 'CSE', 4, 3, 1, true),
('51234567-89ab-cdef-0123-456789abcde1', 5, 'AI502', 'Neural Networks', 'NN', 'CSE', 3, 2, 1, true),
('61234567-89ab-cdef-0123-456789abcde1', 5, 'DS501', 'Big Data Analytics', 'BDA', 'CSE', 4, 3, 1, true),
('71234567-89ab-cdef-0123-456789abcde1', 5, 'DS502', 'Data Mining', 'DM', 'CSE', 3, 2, 1, true),
('81234567-89ab-cdef-0123-456789abcde1', 5, 'IOT501', 'Internet of Things', 'IOT', 'CSE', 3, 2, 1, true),

-- Semester 6 (Even) - Advanced Courses
('91234567-89ab-cdef-0123-456789abcde1', 6, 'AI601', 'Deep Learning', 'DL', 'CSE', 4, 3, 1, true),
('a1234567-89ab-cdef-0123-456789abcde1', 6, 'DS601', 'Data Visualization', 'DV', 'CSE', 3, 2, 1, true),
('b1234567-89ab-cdef-0123-456789abcde1', 6, 'CS601', 'Compiler Design', 'CD', 'CSE', 4, 3, 1, true),
('c1234567-89ab-cdef-0123-456789abcde1', 6, 'CS602', 'Web Technologies', 'WT', 'CSE', 3, 2, 1, true),
('d1234567-89ab-cdef-0123-456789abcde1', 6, 'CS603', 'Mobile App Development', 'MAD', 'CSE', 3, 2, 1, true),

-- ECE Specific Courses
('e1234567-89ab-cdef-0123-456789abcde1', 3, 'EC301', 'Signals and Systems', 'SS', 'ECE', 4, 3, 1, true),
('f1234567-89ab-cdef-0123-456789abcde1', 4, 'EC401', 'Communication Systems', 'CS', 'ECE', 4, 3, 1, true),
('01234567-89ab-cdef-0123-456789abcde2', 5, 'EC501', 'VLSI Design', 'VLSI', 'ECE', 4, 3, 1, true),
('11234567-89ab-cdef-0123-456789abcde2', 6, 'EC601', 'Embedded Systems', 'ES', 'ECE', 4, 3, 1, true);
```

## Step 2: Insert Demo Rooms

```sql
-- Insert demo rooms (classrooms and labs)
INSERT INTO rooms (id, room_number, room_type, capacity, floor, building, facilities, is_active) VALUES
-- Classrooms
('room0001-89ab-cdef-0123-456789abcdef', 'CR-101', 'Classroom', 60, 1, 'Main Block', ARRAY['Projector', 'AC', 'Whiteboard'], true),
('room0002-89ab-cdef-0123-456789abcdef', 'CR-102', 'Classroom', 60, 1, 'Main Block', ARRAY['Projector', 'AC', 'Whiteboard'], true),
('room0003-89ab-cdef-0123-456789abcdef', 'CR-103', 'Classroom', 80, 1, 'Main Block', ARRAY['Projector', 'AC', 'Whiteboard', 'Audio System'], true),
('room0004-89ab-cdef-0123-456789abcdef', 'CR-201', 'Classroom', 60, 2, 'Main Block', ARRAY['Projector', 'AC', 'Whiteboard'], true),
('room0005-89ab-cdef-0123-456789abcdef', 'CR-202', 'Classroom', 60, 2, 'Main Block', ARRAY['Projector', 'AC', 'Whiteboard'], true),
('room0006-89ab-cdef-0123-456789abcdef', 'CR-203', 'Classroom', 80, 2, 'Main Block', ARRAY['Projector', 'AC', 'Whiteboard', 'Audio System'], true),
('room0007-89ab-cdef-0123-456789abcdef', 'CR-301', 'Classroom', 50, 3, 'Main Block', ARRAY['Projector', 'Whiteboard'], true),
('room0008-89ab-cdef-0123-456789abcdef', 'CR-302', 'Classroom', 50, 3, 'Main Block', ARRAY['Projector', 'Whiteboard'], true),

-- Labs
('room0009-89ab-cdef-0123-456789abcdef', 'LAB-101', 'Lab', 30, 1, 'Tech Block', ARRAY['Computers', 'Projector', 'AC', 'Network'], true),
('room0010-89ab-cdef-0123-456789abcdef', 'LAB-102', 'Lab', 30, 1, 'Tech Block', ARRAY['Computers', 'Projector', 'AC', 'Network'], true),
('room0011-89ab-cdef-0123-456789abcdef', 'LAB-201', 'Lab', 40, 2, 'Tech Block', ARRAY['Computers', 'Projector', 'AC', 'Network', 'Server'], true),
('room0012-89ab-cdef-0123-456789abcdef', 'LAB-202', 'Lab', 30, 2, 'Tech Block', ARRAY['Computers', 'Projector', 'AC', 'Network'], true),
('room0013-89ab-cdef-0123-456789abcdef', 'LAB-301', 'Lab', 25, 3, 'Tech Block', ARRAY['Specialized Equipment', 'Projector', 'AC'], true),
('room0014-89ab-cdef-0123-456789abcdef', 'LAB-302', 'Lab', 25, 3, 'Tech Block', ARRAY['Specialized Equipment', 'Projector', 'AC'], true);
```

## Step 3: Insert Demo Users (for created_by field)

```sql
-- Insert demo users
INSERT INTO \"user\" (id, email, name, role) VALUES
('user0001-89ab-cdef-0123-456789abcdef', 'admin@college.edu', 'System Admin', 'editor'),
('user0002-89ab-cdef-0123-456789abcdef', 'timetable@college.edu', 'Timetable Manager', 'editor');
```

## Step 4: Generate Massive Timetable Entries

### Academic Year 2024-25, Even Semester (Current)

````sql
-- Timetable entries for CR-101 (Classroom)
```sql```
INSERT INTO timetable_entries (id, academic_year, semester_type, room_id, subject_id, branch, section, day, time_slot, color_code, notes, created_by) VALUES
-- Monday
(gen_random_uuid(), '2024-25', 'even', '24349be7-4673-45f4-8045-654f1a9b3887', '06aa0522-31e5-410c-b5c1-10407c298dc8', 'CSE', 'A', 'Monday', '8:00-8:55', '#3B82F6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1f000d52-6412-4346-8c6c-f9f7b510da0a', '0549a946-5e71-494a-b0e5-eedf6b7e15b0', 'CSE', 'A', 'Monday', '9:00-9:55', '#10B981', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1bce373e-44ea-4090-9030-f83fa420e6c7', '0478299b-fb5e-445d-9cf8-b734f1cba16e', 'CSE', 'A', 'Monday', '10:00-10:55', '#F59E0B', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '06f361d0-8ef8-4a75-ab2a-a44a632090f5', '008616eb-352f-48eb-a0cf-d7843b4e8d0e', 'CSE', 'A', 'Monday', '11:00-11:55', '#8B5CF6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),

-- Tuesday
(gen_random_uuid(), '2024-25', 'even', '1f000d52-6412-4346-8c6c-f9f7b510da0a', '0549a946-5e71-494a-b0e5-eedf6b7e15b0', 'CSE', 'B', 'Tuesday', '8:00-8:55', '#10B981', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '24349be7-4673-45f4-8045-654f1a9b3887', '06aa0522-31e5-410c-b5c1-10407c298dc8', 'CSE', 'B', 'Tuesday', '9:00-9:55', '#3B82F6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '06f361d0-8ef8-4a75-ab2a-a44a632090f5', '008616eb-352f-48eb-a0cf-d7843b4e8d0e', 'CSE', 'B', 'Tuesday', '10:00-10:55', '#8B5CF6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1bce373e-44ea-4090-9030-f83fa420e6c7', '0478299b-fb5e-445d-9cf8-b734f1cba16e', 'CSE', 'B', 'Tuesday', '11:00-11:55', '#F59E0B', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),

-- Wednesday
(gen_random_uuid(), '2024-25', 'even', '1bce373e-44ea-4090-9030-f83fa420e6c7', '0478299b-fb5e-445d-9cf8-b734f1cba16e', 'CSE', 'C', 'Wednesday', '8:00-8:55', '#3B82F6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '06f361d0-8ef8-4a75-ab2a-a44a632090f5', '008616eb-352f-48eb-a0cf-d7843b4e8d0e', 'CSE', 'C', 'Wednesday', '9:00-9:55', '#8B5CF6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '24349be7-4673-45f4-8045-654f1a9b3887', '06aa0522-31e5-410c-b5c1-10407c298dc8', 'CSE', 'C', 'Wednesday', '10:00-10:55', '#10B981', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1f000d52-6412-4346-8c6c-f9f7b510da0a', '0549a946-5e71-494a-b0e5-eedf6b7e15b0', 'CSE', 'C', 'Wednesday', '11:00-11:55', '#F59E0B', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),

-- Thursday
(gen_random_uuid(), '2024-25', 'even', '06f361d0-8ef8-4a75-ab2a-a44a632090f5', '008616eb-352f-48eb-a0cf-d7843b4e8d0e', 'ECE', 'A', 'Thursday', '8:00-8:55', '#10B981', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1bce373e-44ea-4090-9030-f83fa420e6c7', '0478299b-fb5e-445d-9cf8-b734f1cba16e', 'ECE', 'A', 'Thursday', '9:00-9:55', '#F59E0B', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '24349be7-4673-45f4-8045-654f1a9b3887', '06aa0522-31e5-410c-b5c1-10407c298dc8', 'ECE', 'A', 'Thursday', '10:00-10:55', '#8B5CF6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1f000d52-6412-4346-8c6c-f9f7b510da0a', '0549a946-5e71-494a-b0e5-eedf6b7e15b0', 'ECE', 'A', 'Thursday', '11:00-11:55', '#EF4444', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),

-- Friday
(gen_random_uuid(), '2024-25', 'even', '1bce373e-44ea-4090-9030-f83fa420e6c7', '0478299b-fb5e-445d-9cf8-b734f1cba16e', 'ECE', 'B', 'Friday', '8:00-8:55', '#8B5CF6', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '06f361d0-8ef8-4a75-ab2a-a44a632090f5', '008616eb-352f-48eb-a0cf-d7843b4e8d0e', 'ECE', 'B', 'Friday', '9:00-9:55', '#10B981', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '24349be7-4673-45f4-8045-654f1a9b3887', '06aa0522-31e5-410c-b5c1-10407c298dc8', 'ECE', 'B', 'Friday', '10:00-10:55', '#F59E0B', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1f000d52-6412-4346-8c6c-f9f7b510da0a', '0549a946-5e71-494a-b0e5-eedf6b7e15b0', 'ECE', 'B', 'Friday', '11:00-11:55', '#EF4444', 'Theory Session', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),

-- Saturday
(gen_random_uuid(), '2024-25', 'even', '06f361d0-8ef8-4a75-ab2a-a44a632090f5', '008616eb-352f-48eb-a0cf-d7843b4e8d0e', 'CSE', 'A', 'Saturday', '8:00-8:55', '#F59E0B', 'Tutorial', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e'),
(gen_random_uuid(), '2024-25', 'even', '1bce373e-44ea-4090-9030-f83fa420e6c7', '0478299b-fb5e-445d-9cf8-b734f1cba16e', 'CSE', 'A', 'Saturday', '9:00-9:55', '#10B981', 'Tutorial', 'd1e6b63a-fa9a-4bc8-8684-99ef4fab879e');
````

### Lab Sessions

```sql
-- Lab sessions in LAB-101
INSERT INTO timetable_entries (id, academic_year, semester_type, room_id, subject_id, branch, section, day, time_slot, color_code, notes, created_by) VALUES
-- Data Structures Lab Sessions
(gen_random_uuid(), '2024-25', 'even', 'room0009-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '14:00-14:55', '#1E40AF', 'DS Lab Session 1', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0009-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '15:00-15:55', '#1E40AF', 'DS Lab Session 2', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0009-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Wednesday', '14:00-14:55', '#7C3AED', 'DLD Lab Session 1', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0009-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Wednesday', '15:00-15:55', '#7C3AED', 'DLD Lab Session 2', 'user0001-89ab-cdef-0123-456789abcdef'),

-- Chemistry Lab Sessions
(gen_random_uuid(), '2024-25', 'even', 'room0010-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Thursday', '14:00-14:55', '#D97706', 'Chemistry Lab 1', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0010-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Thursday', '15:00-15:55', '#D97706', 'Chemistry Lab 2', 'user0001-89ab-cdef-0123-456789abcdef'),

-- Section B Lab Sessions
(gen_random_uuid(), '2024-25', 'even', 'room0009-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcdef', 'CSE', 'B', 'Tuesday', '14:00-14:55', '#1E40AF', 'DS Lab Session 1', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0009-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcdef', 'CSE', 'B', 'Tuesday', '15:00-15:55', '#1E40AF', 'DS Lab Session 2', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0010-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcdef', 'CSE', 'B', 'Friday', '14:00-14:55', '#D97706', 'Chemistry Lab 1', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0010-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcdef', 'CSE', 'B', 'Friday', '15:00-15:55', '#D97706', 'Chemistry Lab 2', 'user0001-89ab-cdef-0123-456789abcdef');
```

### Additional Classrooms (CR-102, CR-103)

```sql
-- CR-102 Timetable
INSERT INTO timetable_entries (id, academic_year, semester_type, room_id, subject_id, branch, section, day, time_slot, color_code, notes, created_by) VALUES
-- Semester 4 classes in CR-102
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', 'f1234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '8:00-8:55', '#059669', 'DBMS Theory', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcde1', 'CSE', 'A', 'Monday', '9:00-9:55', '#DC2626', 'Computer Networks', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '11234567-89ab-cdef-0123-456789abcde1', 'CSE', 'A', 'Monday', '10:00-10:55', '#7C2D12', 'Operating Systems', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '21234567-89ab-cdef-0123-456789abcde1', 'CSE', 'A', 'Monday', '11:00-11:55', '#1D4ED8', 'Probability & Statistics', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '31234567-89ab-cdef-0123-456789abcde1', 'CSE', 'A', 'Monday', '14:00-14:55', '#9333EA', 'Software Engineering', 'user0001-89ab-cdef-0123-456789abcdef'),

-- Tuesday CR-102
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcde1', 'CSE', 'B', 'Tuesday', '8:00-8:55', '#DC2626', 'Computer Networks', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', 'f1234567-89ab-cdef-0123-456789abcdef', 'CSE', 'B', 'Tuesday', '9:00-9:55', '#059669', 'DBMS Theory', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '21234567-89ab-cdef-0123-456789abcde1', 'CSE', 'B', 'Tuesday', '10:00-10:55', '#1D4ED8', 'Probability & Statistics', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '11234567-89ab-cdef-0123-456789abcde1', 'CSE', 'B', 'Tuesday', '11:00-11:55', '#7C2D12', 'Operating Systems', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0002-89ab-cdef-0123-456789abcdef', '31234567-89ab-cdef-0123-456789abcde1', 'CSE', 'B', 'Tuesday', '14:00-14:55', '#9333EA', 'Software Engineering', 'user0001-89ab-cdef-0123-456789abcdef');
```

### ECE Specific Courses

```sql
-- ECE courses in CR-203
INSERT INTO timetable_entries (id, academic_year, semester_type, room_id, subject_id, branch, section, day, time_slot, color_code, notes, created_by) VALUES
-- ECE Semester 4 in CR-203
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', 'f1234567-89ab-cdef-0123-456789abcde1', 'ECE', 'A', 'Monday', '8:00-8:55', '#B91C1C', 'Communication Systems', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', '61234567-89ab-cdef-0123-456789abcdef', 'ECE', 'A', 'Monday', '9:00-9:55', '#10B981', 'Engineering Mathematics II', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcdef', 'ECE', 'A', 'Monday', '10:00-10:55', '#8B5CF6', 'Digital Logic Design', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', '21234567-89ab-cdef-0123-456789abcde1', 'ECE', 'A', 'Monday', '11:00-11:55', '#1D4ED8', 'Probability & Statistics', 'user0001-89ab-cdef-0123-456789abcdef'),

-- ECE Semester 6 Advanced Courses
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', '11234567-89ab-cdef-0123-456789abcde2', 'ECE', 'A', 'Wednesday', '8:00-8:55', '#7C3AED', 'Embedded Systems', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcde2', 'ECE', 'A', 'Wednesday', '9:00-9:55', '#059669', 'VLSI Design', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2024-25', 'even', 'room0006-89ab-cdef-0123-456789abcdef', 'e1234567-89ab-cdef-0123-456789abcde1', 'ECE', 'A', 'Wednesday', '10:00-10:55', '#DC2626', 'Signals and Systems', 'user0001-89ab-cdef-0123-456789abcdef');
```

## Step 5: Generate Odd Semester Data (2025-26)

```sql
-- Sample Odd Semester entries for 2025-26
INSERT INTO timetable_entries (id, academic_year, semester_type, room_id, subject_id, branch, section, day, time_slot, color_code, notes, created_by) VALUES
-- Semester 1 courses in CR-101
(gen_random_uuid(), '2025-26', 'odd', 'room0001-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '8:00-8:55', '#3B82F6', 'Programming Fundamentals', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0001-89ab-cdef-0123-456789abcdef', '11234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '9:00-9:55', '#10B981', 'Engineering Mathematics I', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0001-89ab-cdef-0123-456789abcdef', '21234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '10:00-10:55', '#F59E0B', 'Physics I', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0001-89ab-cdef-0123-456789abcdef', '31234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '11:00-11:55', '#8B5CF6', 'Engineering Graphics', 'user0001-89ab-cdef-0123-456789abcdef'),

-- Semester 3 courses
(gen_random_uuid(), '2025-26', 'odd', 'room0002-89ab-cdef-0123-456789abcdef', 'a1234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '8:00-8:55', '#059669', 'Object Oriented Programming', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0002-89ab-cdef-0123-456789abcdef', 'b1234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '9:00-9:55', '#DC2626', 'Computer Organization', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0002-89ab-cdef-0123-456789abcdef', 'c1234567-89ab-cdef-0123-456789abcdef', 'CSE', 'A', 'Monday', '10:00-10:55', '#7C2D12', 'Discrete Mathematics', 'user0001-89ab-cdef-0123-456789abcdef'),

-- Semester 5 Specialization courses
(gen_random_uuid(), '2025-26', 'odd', 'room0003-89ab-cdef-0123-456789abcdef', '41234567-89ab-cdef-0123-456789abcde1', 'CSE-AIML', 'A', 'Monday', '8:00-8:55', '#7C3AED', 'Machine Learning', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0003-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcde1', 'CSE-AIML', 'A', 'Monday', '9:00-9:55', '#9333EA', 'Neural Networks', 'user0001-89ab-cdef-0123-456789abcdef'),

(gen_random_uuid(), '2025-26', 'odd', 'room0004-89ab-cdef-0123-456789abcdef', '61234567-89ab-cdef-0123-456789abcde1', 'CSE-DS', 'A', 'Monday', '8:00-8:55', '#1D4ED8', 'Big Data Analytics', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0004-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcde1', 'CSE-DS', 'A', 'Monday', '9:00-9:55', '#0F766E', 'Data Mining', 'user0001-89ab-cdef-0123-456789abcdef'),

(gen_random_uuid(), '2025-26', 'odd', 'room0005-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcde1', 'CSE-HCIOT', 'A', 'Monday', '8:00-8:55', '#EA580C', 'Internet of Things', 'user0001-89ab-cdef-0123-456789abcdef');
```

## Advanced Lab Sessions with Specializations

```sql
-- Advanced Lab sessions for specializations
INSERT INTO timetable_entries (id, academic_year, semester_type, room_id, subject_id, branch, section, day, time_slot, color_code, notes, created_by) VALUES
-- AI/ML Labs
(gen_random_uuid(), '2025-26', 'odd', 'room0011-89ab-cdef-0123-456789abcdef', '41234567-89ab-cdef-0123-456789abcde1', 'CSE-AIML', 'A', 'Tuesday', '14:00-14:55', '#6B21A8', 'ML Lab - Python & Libraries', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0011-89ab-cdef-0123-456789abcdef', '41234567-89ab-cdef-0123-456789abcde1', 'CSE-AIML', 'A', 'Tuesday', '15:00-15:55', '#6B21A8', 'ML Lab - Model Training', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0011-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcde1', 'CSE-AIML', 'A', 'Thursday', '14:00-14:55', '#7E22CE', 'Neural Networks Lab', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0011-89ab-cdef-0123-456789abcdef', '51234567-89ab-cdef-0123-456789abcde1', 'CSE-AIML', 'A', 'Thursday', '15:00-15:55', '#7E22CE', 'Deep Learning Practice', 'user0001-89ab-cdef-0123-456789abcdef'),

-- Data Science Labs
(gen_random_uuid(), '2025-26', 'odd', 'room0012-89ab-cdef-0123-456789abcdef', '61234567-89ab-cdef-0123-456789abcde1', 'CSE-DS', 'A', 'Wednesday', '14:00-14:55', '#1E3A8A', 'Big Data Lab - Hadoop', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0012-89ab-cdef-0123-456789abcdef', '61234567-89ab-cdef-0123-456789abcde1', 'CSE-DS', 'A', 'Wednesday', '15:00-15:55', '#1E3A8A', 'Spark Analytics', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0012-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcde1', 'CSE-DS', 'A', 'Friday', '14:00-14:55', '#134E4A', 'Data Mining Lab', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0012-89ab-cdef-0123-456789abcdef', '71234567-89ab-cdef-0123-456789abcde1', 'CSE-DS', 'A', 'Friday', '15:00-15:55', '#134E4A', 'Visualization Tools', 'user0001-89ab-cdef-0123-456789abcdef'),

-- IoT Labs
(gen_random_uuid(), '2025-26', 'odd', 'room0013-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcde1', 'CSE-HCIOT', 'A', 'Monday', '14:00-14:55', '#C2410C', 'IoT Hardware Lab', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0013-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcde1', 'CSE-HCIOT', 'A', 'Monday', '15:00-15:55', '#C2410C', 'Sensor Integration', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0013-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcde1', 'CSE-HCIOT', 'A', 'Wednesday', '14:00-14:55', '#C2410C', 'Cloud Connectivity', 'user0001-89ab-cdef-0123-456789abcdef'),
(gen_random_uuid(), '2025-26', 'odd', 'room0013-89ab-cdef-0123-456789abcdef', '81234567-89ab-cdef-0123-456789abcde1', 'CSE-HCIOT', 'A', 'Wednesday', '15:00-15:55', '#C2410C', 'IoT Project Work', 'user0001-89ab-cdef-0123-456789abcdef');
```

## Bulk Generation Script (PostgreSQL)

For generating massive amounts of data, you can use this stored procedure:

```sql
-- Function to generate bulk timetable entries
CREATE OR REPLACE FUNCTION generate_bulk_timetable_entries()
RETURNS void AS $$
DECLARE
    room_rec RECORD;
    subject_rec RECORD;
    day_val TEXT;
    time_val TEXT;
    branch_val TEXT;
    section_val TEXT;
    counter INTEGER := 0;
BEGIN
    -- Arrays for iteration
    FOR room_rec IN SELECT id, room_number FROM rooms WHERE is_active = true LOOP
        FOR day_val IN SELECT unnest(ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) LOOP
            FOR time_val IN SELECT unnest(ARRAY[
                '8:00-8:55', '9:00-9:55', '10:00-10:55', '11:00-11:55',
                '12:00-12:55', '13:00-13:55', '14:00-14:55', '15:00-15:55',
                '16:00-16:55', '17:00-17:55'
            ]) LOOP
                FOR branch_val IN SELECT unnest(ARRAY['CSE', 'CSE-AIML', 'CSE-DS', 'ECE']) LOOP
                    FOR section_val IN SELECT unnest(ARRAY['A', 'B', 'C']) LOOP
                        -- Only insert if random condition met (to create realistic gaps)
                        IF random() > 0.4 THEN  -- 60% occupancy rate
                            -- Select random subject
                            SELECT id INTO subject_rec FROM subjects
                            WHERE is_active = true
                            ORDER BY random()
                            LIMIT 1;

                            INSERT INTO timetable_entries (
                                id, academic_year, semester_type, room_id, subject_id,
                                branch, section, day, time_slot,
                                color_code, notes, created_by
                            ) VALUES (
                                gen_random_uuid(),
                                '2024-25',
                                'even',
                                room_rec.id,
                                subject_rec.id,
                                branch_val::branch_enum,
                                section_val::section_enum,
                                day_val::day_enum,
                                time_val::time_slot_enum,
                                ARRAY['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#059669', '#DC2626'][1 + floor(random() * 7)::INTEGER],
                                'Auto-generated entry for ' || room_rec.room_number,
                                'user0001-89ab-cdef-0123-456789abcdef'
                            );

                            counter := counter + 1;
                        END IF;
                    END LOOP;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Generated % timetable entries', counter;
END;
$$ LANGUAGE plpgsql;

-- Execute the bulk generation
SELECT generate_bulk_timetable_entries();
```

## Statistics Queries

```sql
-- Check total entries per academic year/semester
SELECT
    academic_year,
    semester_type,
    COUNT(*) as total_entries,
    COUNT(DISTINCT room_id) as rooms_used,
    COUNT(DISTINCT subject_id) as subjects_scheduled
FROM timetable_entries
GROUP BY academic_year, semester_type
ORDER BY academic_year, semester_type;

-- Room utilization analysis
SELECT
    r.room_number,
    r.room_type,
    COUNT(te.*) as total_classes,
    ROUND(COUNT(te.*) * 100.0 / (6 * 10), 2) as utilization_percentage
FROM rooms r
LEFT JOIN timetable_entries te ON r.id = te.room_id
WHERE te.academic_year = '2024-25' AND te.semester_type = 'even'
GROUP BY r.id, r.room_number, r.room_type
ORDER BY utilization_percentage DESC;

-- Subject popularity (most scheduled courses)
SELECT
    s.course_code,
    s.course_name,
    COUNT(te.*) as times_scheduled,
    COUNT(DISTINCT te.branch) as branches_taking,
    COUNT(DISTINCT te.section) as sections_taking
FROM subjects s
LEFT JOIN timetable_entries te ON s.id = te.subject_id
WHERE te.academic_year = '2024-25' AND te.semester_type = 'even'
GROUP BY s.id, s.course_code, s.course_name
ORDER BY times_scheduled DESC;

-- Time slot analysis
SELECT
    time_slot,
    COUNT(*) as classes_scheduled,
    COUNT(DISTINCT room_id) as rooms_used
FROM timetable_entries
WHERE academic_year = '2024-25' AND semester_type = 'even'
GROUP BY time_slot
ORDER BY time_slot;

-- Branch-wise distribution
SELECT
    branch,
    COUNT(*) as total_classes,
    COUNT(DISTINCT subject_id) as unique_subjects,
    COUNT(DISTINCT room_id) as rooms_used
FROM timetable_entries
WHERE academic_year = '2024-25' AND semester_type = 'even'
GROUP BY branch
ORDER BY total_classes DESC;
```

## Usage Instructions

1. **Run the SQL commands in order** - subjects first, then rooms, then users, then timetable entries
2. **Modify UUIDs** - Replace the hardcoded UUIDs with actual UUIDs from your database
3. **Adjust data** - Modify course codes, room numbers, and other data to match your college's actual structure
4. **Use bulk generation** - Run the stored procedure for massive data generation
5. **Verify data** - Use the statistics queries to ensure data looks realistic

This will give you **hundreds to thousands** of realistic timetable entries for testing your application!
