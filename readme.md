# Student Attendance Tracker

A responsive web application for recording, managing, and reviewing student attendance. The project is being developed collaboratively using HTML, CSS, JavaScript, and GitHub.

## Features

- Dashboard with total students, present students, absent students, and attendance percentage
- Add, edit, delete, search, and filter student records
- Store student name, roll number, department, semester, and section
- Select an attendance date and mark students present or absent
- Mark all students present or absent at once
- Prevent duplicate attendance records for the same student and date
- Individual and overall attendance percentages
- Low-attendance warnings using a configurable percentage limit
- Date-wise and monthly attendance summaries
- Export attendance reports as CSV files
- Responsive layout for desktop, tablet, and mobile screens
- Form validation and clear success or error messages

## Technology Stack

- HTML5 for the application structure
- CSS3 for styling and responsive layouts
- Vanilla JavaScript for interactions and calculations
- `localStorage` for the first version of data persistence
- Git and GitHub for version control and collaboration

## Project Structure

```text
student_attendance_tracker/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js          # UI rendering, navigation, forms, and reports
│   ├── students.js     # Student record management
│   ├── attendance.js  # Date-based attendance records
│   └── storage.js     # Browser localStorage persistence
└── readme.md
```

## What’s Included

- Dashboard with date-specific attendance totals and attendance rate
- Student profiles with duplicate roll-number validation, search, and department filters
- Date-wise attendance marking, bulk present/absent actions, and duplicate-safe updates
- Attendance summaries for the current month or all recorded dates
- Configurable low-attendance warnings and CSV report downloads
- Responsive layout and clear empty, validation, and storage-error states

## Getting Started

1. Clone the repository:

	```bash
	git clone https://github.com/Sanmaan330/student_attendance_tracker.git
	cd student_attendance_tracker
	```

2. Open the project folder in VS Code and launch `index.html` with the Live Server extension. The app uses JavaScript modules, so serve it over HTTP instead of opening the file directly.

3. Create a feature branch before making changes:

	```bash
	git checkout main
	git pull origin main
	git checkout -b feature/your-feature-name
	```

Student and attendance data are saved in the browser’s `localStorage` on the device where the app is used. Data is not synchronized between collaborators or browsers; do not enter sensitive student information into a public demo.

## Collaboration Workflow

The `main` branch is the shared stable branch. Do not work directly on `main`.

1. Pull the latest code before starting:

	```bash
	git checkout main
	git pull origin main
	```

2. Create a focused branch:

	```bash
	git checkout -b feature/attendance-marking
	```

3. Make and test your changes, then commit them:

	```bash
	git add .
	git commit -m "Add attendance marking"
	```

4. Push the branch to GitHub:

	```bash
	git push -u origin feature/attendance-marking
	```

5. Open a Pull Request from your branch into `main`.
6. Ask the other collaborator to review the changes.
7. Resolve review comments, if any, and push the updates to the same branch.
8. Merge the Pull Request after approval.
9. Delete the merged branch if it is no longer needed.

## Keeping a Feature Branch Updated

Before opening or merging a Pull Request, update the feature branch carefully:

```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
git push
```

If a merge conflict occurs, edit the conflicted files, test the result, and then run:

```bash
git add .
git commit -m "Resolve merge conflicts"
git push
```

## Suggested Branch Names

- `feature/dashboard`
- `feature/student-management`
- `feature/attendance-marking`
- `feature/reports`
- `fix/form-validation`
- `docs/update-readme`

## Future Improvements

- User login and teacher or administrator roles
- Firebase or a Node.js backend database
- Cloud synchronization between devices
- PDF report generation
- Subject-wise attendance tracking
- Import students from CSV files

## Contributors

Add the names and GitHub usernames of all collaborators here.
