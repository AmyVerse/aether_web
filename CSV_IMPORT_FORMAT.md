# CSV Import Format for Timetable System

## Overview

The timetable system supports importing CSV files in a grid format that matches the visual representation of the timetable. This allows you to easily import timetable data using plain text course codes and room numbers.

## CSV Format Structure

### Single Room Format

```csv
"CR-101"

"Days","8:00-8:55","9:00-9:55","10:00-10:55","11:00-11:55","12:00-12:55","13:00-13:55","14:00-14:55","15:00-15:55","16:00-16:55","17:00-17:55"
"Monday","DS (ECE-A)","MATH","","OS (CSE-B)","","","WEB","","",""
"Tuesday","","OS","ALGO","","LUNCH","DB","","","",""
"Wednesday","DS","","MATH (ECE-A)","","","","","","",""
"Thursday","","","","","","","","","",""
"Friday","PROJ","","","","","","","","",""
"Saturday","","","","","","","","","",""
```

### Multiple Rooms Format

```csv
"Complete Timetable Export - 2024-25 odd Semester"
"Export Date: 12/29/2024"


"CR-101"

"Days","8:00-8:55","9:00-9:55","10:00-10:55","11:00-11:55","12:00-12:55","13:00-13:55","14:00-14:55","15:00-15:55","16:00-16:55","17:00-17:55"
"Monday","DS (ECE-A)","MATH","","OS (CSE-B)","","","WEB","","",""
"Tuesday","","OS","ALGO","","LUNCH","DB","","","",""
"Wednesday","DS","","MATH (ECE-A)","","","","","","",""
"Thursday","","","","","","","","","",""
"Friday","PROJ","","","","","","","","",""
"Saturday","","","","","","","","","",""


"LAB-201"

"Days","8:00-8:55","9:00-9:55","10:00-10:55","11:00-11:55","12:00-12:55","13:00-13:55","14:00-14:55","15:00-15:55","16:00-16:55","17:00-17:55"
"Monday","","","DSL (ECE-A)","DSL (ECE-A)","","","","","",""
"Tuesday","","","","","","WDL (CSE-B)","WDL (CSE-B)","","",""
"Wednesday","","","","","","","","","",""
"Thursday","","","OSL (CSE-A)","OSL (CSE-A)","","","","","",""
"Friday","","","","","","","","","",""
"Saturday","","","","","","","","","",""
```

## Cell Content Format

### Basic Course Entry

- **Simple format**: `COURSE_CODE`
  - Example: `DS`, `MATH`, `OS`

### Course with Branch and Section

- **Format**: `COURSE_CODE (BRANCH-SECTION)`
  - Example: `DS (ECE-A)`, `OS (CSE-B)`, `WDL (IT-C)`

### Empty Cells

- Leave cells empty with `""` or just empty commas for no class scheduled

## Supported Plain Text Mappings

The system intelligently maps plain text to database UUIDs using multiple strategies:

### 1. Direct Course Code Matching

- `CS101` → matches course with code "CS101"
- `MATH201` → matches course with code "MATH201"

### 2. Short Name Matching

- `DS` → matches "Data Structures" if short_name is "DS"
- `OS` → matches "Operating Systems" if short_name is "OS"
- `WEB` → matches "Web Development" if short_name is "WEB"

### 3. Acronym Matching

- `DS` → matches "Data Structures" (first letters: **D**ata **S**tructures)
- `OS` → matches "Operating Systems" (first letters: **O**perating **S**ystems)
- `AI` → matches "Artificial Intelligence" (first letters: **A**rtificial **I**ntelligence)

### 4. Partial Course Name Matching

- `Database` → matches courses containing "Database" in the name
- `Structure` → matches "Data Structures" course

### 5. Room Number Matching

- `CR-101` → matches room with room_number "CR-101"
- `LAB-201` → matches room with room_number "LAB-201"
- Case-insensitive matching: `cr-101` also matches "CR-101"

## Branch and Section Codes

### Common Branch Codes

- `CSE` - Computer Science Engineering
- `ECE` - Electronics and Communication Engineering
- `IT` - Information Technology
- `ME` - Mechanical Engineering
- `CE` - Civil Engineering
- `EE` - Electrical Engineering

### Section Codes

- `A`, `B`, `C`, `D` - Standard section identifiers

## Example Import Workflow

1. **Export Current Timetable**: Use the export feature to get a template in the correct format
2. **Edit CSV File**: Modify the exported CSV with your changes using plain text codes
3. **Import Modified CSV**: Upload the file, and the system will:
   - Parse the grid format
   - Map room numbers to database IDs
   - Map course codes to subject IDs (using flexible matching)
   - Validate all entries
   - Show warnings for unmapped items
   - Import valid entries to the database

## Error Handling

### Unmapped Items

- **Unmapped Rooms**: System shows which room numbers couldn't be matched
- **Unmapped Subjects**: System shows which course codes couldn't be matched

### Invalid Entries

- Entries missing required fields (room_id, subject_id)
- Invalid day or time slot values
- System counts and reports invalid entries

### Import Summary

- Shows count of successfully imported entries
- Lists any warnings or errors
- Refreshes the timetable grid after successful import

## Tips for Successful Import

1. **Use Exported CSV as Template**: Always start with an exported CSV to ensure correct format
2. **Check Room Numbers**: Ensure room numbers in CSV match exactly with database entries
3. **Verify Course Codes**: Use recognizable course codes or short names
4. **Test Small Batches**: Import small sections first to verify mapping works correctly
5. **Review Warnings**: Check unmapped items and correct them in your data before re-importing

## Supported File Types

- **CSV files** (`.csv`) - Primary format, fully supported
- **Excel files** (`.xlsx`, `.xls`) - Parsed as CSV format internally

The system prioritizes CSV format for better compatibility and faster processing.
