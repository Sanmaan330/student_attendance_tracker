import { attendanceStore } from "./attendance.js";
import { storage } from "./storage.js";
import { studentStore } from "./students.js";

const byId = (id) => document.getElementById(id);
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};
const escapeCsv = (value) => {
  const text = String(value ?? "");
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

let threshold = storage.getThreshold();
let toastTimer;

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function handleError(error) {
  console.error(error);
  showToast(error instanceof Error ? error.message : "Something went wrong. Please try again.");
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function statusBadge(status) {
  const label = status ? status[0].toUpperCase() + status.slice(1) : "Not marked";
  return element("span", `status-badge ${status ? `status-${status}` : "status-unmarked"}`, label);
}

function studentAvatar(student) {
  const name = element("div", `student-avatar tone-${student.name.charCodeAt(0) % 5}`);
  name.textContent = student.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  name.setAttribute("aria-hidden", "true");
  return name;
}

function studentCell(student, includeDepartment = false) {
  const cell = element("div", "student-cell");
  cell.append(studentAvatar(student));
  const details = element("div");
  details.append(element("strong", "", student.name));
  details.append(element("small", "", includeDepartment ? student.department : `Section ${student.section}`));
  cell.append(details);
  return cell;
}

function selectedDate() {
  return byId("attendance-date").value || today();
}

function selectedDashboardDate() {
  return byId("dashboard-date").value || today();
}

function dateStatistics(date) {
  const students = studentStore.listStudents();
  let present = 0;
  let absent = 0;
  students.forEach((student) => {
    const status = attendanceStore.getStatus(student.id, date);
    if (status === "present") present += 1;
    if (status === "absent") absent += 1;
  });
  const marked = present + absent;
  return { total: students.length, present, absent, unmarked: students.length - marked, rate: marked ? Math.round((present / marked) * 100) : 0 };
}

function renderDashboard() {
  const date = selectedDashboardDate();
  const stats = dateStatistics(date);
  byId("stat-total").textContent = String(stats.total);
  byId("stat-present").textContent = String(stats.present);
  byId("stat-absent").textContent = String(stats.absent);
  byId("stat-rate").textContent = String(stats.rate);
  byId("chart-rate").textContent = `${stats.rate}%`;
  byId("chart-present").textContent = String(stats.present);
  byId("chart-absent").textContent = String(stats.absent);
  byId("chart-unmarked").textContent = String(stats.unmarked);
  byId("chart-date-label").textContent = formatDate(date);
  byId("attendance-donut").style.background = `conic-gradient(var(--purple) ${stats.rate * 3.6}deg, #f0f0f5 0deg)`;

  const list = byId("dashboard-student-list");
  list.replaceChildren();
  studentStore.listStudents().slice(0, 6).forEach((student) => {
    const status = attendanceStore.getStatus(student.id, date);
    const row = document.createElement("tr");
    const studentTd = document.createElement("td");
    studentTd.append(studentCell(student));
    const rollTd = element("td", "", student.roll);
    const departmentTd = element("td", "", student.department);
    const rateTd = element("td", "", `${studentAttendanceRate(student.id, attendanceStore.listRecords())}%`);
    const statusTd = document.createElement("td");
    statusTd.append(statusBadge(status));
    row.append(studentTd, rollTd, departmentTd, rateTd, statusTd);
    list.append(row);
  });
  byId("dashboard-empty").hidden = stats.total > 0;
}

function renderDepartmentFilter() {
  const filter = byId("department-filter");
  const current = filter.value;
  const departments = [...new Set(studentStore.listStudents().map((student) => student.department))].sort((a, b) => a.localeCompare(b));
  filter.replaceChildren(new Option("All departments", ""));
  departments.forEach((department) => filter.add(new Option(department, department)));
  if (departments.includes(current)) filter.value = current;
}

function renderStudents() {
  renderDepartmentFilter();
  const query = byId("student-search").value.trim().toLocaleLowerCase();
  const department = byId("department-filter").value;
  const students = studentStore.listStudents().filter((student) => {
    const matchesQuery = [student.name, student.roll, student.department, student.semester, student.section]
      .some((value) => value.toLocaleLowerCase().includes(query));
    return matchesQuery && (!department || student.department === department);
  });
  byId("student-count").textContent = String(studentStore.listStudents().length);
  const list = byId("students-list");
  list.replaceChildren();
  students.forEach((student) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.append(studentCell(student));
    const rollCell = element("td", "", student.roll);
    const departmentCell = element("td", "", student.department);
    const semesterCell = element("td", "", student.semester);
    const sectionCell = element("td", "", student.section);
    const actionsCell = document.createElement("td");
    const actions = element("div", "row-actions");
    const editButton = element("button", "icon-button", "✎");
    editButton.type = "button";
    editButton.setAttribute("aria-label", `Edit ${student.name}`);
    editButton.addEventListener("click", () => openStudentDialog(student));
    const deleteButton = element("button", "icon-button", "×");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${student.name}`);
    deleteButton.addEventListener("click", () => deleteStudent(student));
    actions.append(editButton, deleteButton);
    actionsCell.append(actions);
    row.append(nameCell, rollCell, departmentCell, semesterCell, sectionCell, actionsCell);
    list.append(row);
  });
  byId("students-empty").hidden = students.length > 0;
}

function renderAttendance() {
  const date = selectedDate();
  const students = studentStore.listStudents();
  const list = byId("attendance-list");
  list.replaceChildren();
  students.forEach((student) => {
    const status = attendanceStore.getStatus(student.id, date);
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.append(studentCell(student));
    const rollCell = element("td", "", student.roll);
    const departmentCell = element("td", "", student.department);
    const statusCell = document.createElement("td");
    statusCell.append(statusBadge(status));
    const actionCell = document.createElement("td");
    const select = element("select", "status-select");
    select.setAttribute("aria-label", `Attendance status for ${student.name}`);
    select.add(new Option("Choose status", ""));
    select.add(new Option("Present", "present"));
    select.add(new Option("Absent", "absent"));
    select.value = status;
    select.addEventListener("change", () => {
      if (!select.value) return;
      try {
        attendanceStore.setStatus(student.id, date, select.value);
        renderAll();
        showToast(`${student.name} marked ${select.value}.`);
      } catch (error) {
        handleError(error);
        renderAttendance();
      }
    });
    actionCell.append(select);
    row.append(nameCell, rollCell, departmentCell, statusCell, actionCell);
    list.append(row);
  });
  const stats = dateStatistics(date);
  byId("attendance-count").textContent = String(students.length);
  byId("attendance-summary").textContent = `${stats.present} present · ${stats.absent} absent · ${stats.unmarked} not marked`;
  byId("attendance-tally").textContent = `${stats.present} present / ${stats.absent} absent`;
  byId("attendance-empty").hidden = students.length > 0;
}

function studentAttendanceRate(studentId, records) {
  const studentRecords = records.filter((record) => record.studentId === studentId);
  if (!studentRecords.length) return 0;
  return Math.round((studentRecords.filter((record) => record.status === "present").length / studentRecords.length) * 100);
}

function renderReports() {
  const period = byId("report-period").value;
  const records = attendanceStore.recordsForPeriod(period);
  const students = studentStore.listStudents();
  const activeStudentIds = new Set(students.map((student) => student.id));
  const validRecords = records.filter((record) => activeStudentIds.has(record.studentId));
  const dates = new Set(validRecords.map((record) => record.date));
  const presentTotal = validRecords.filter((record) => record.status === "present").length;
  const rate = validRecords.length ? Math.round((presentTotal / validRecords.length) * 100) : 0;
  const atRisk = students.filter((student) =>
    validRecords.some((record) => record.studentId === student.id) && studentAttendanceRate(student.id, validRecords) < threshold
  ).length;

  byId("report-rate").textContent = String(rate);
  byId("report-sessions").textContent = String(dates.size);
  byId("report-risk").textContent = String(atRisk);
  byId("report-records").textContent = String(validRecords.length);
  byId("threshold-display").textContent = `${threshold}%`;
  byId("threshold-input").value = String(threshold);
  byId("report-period-label").textContent = period === "month"
    ? new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "All recorded dates";

  const list = byId("report-list");
  list.replaceChildren();
  students.forEach((student) => {
    const studentRecords = validRecords.filter((record) => record.studentId === student.id);
    if (studentRecords.length === 0) return;
    const present = studentRecords.filter((record) => record.status === "present").length;
    const absent = studentRecords.length - present;
    const studentRate = studentAttendanceRate(student.id, validRecords);
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.append(studentCell(student));
    const rollCell = element("td", "", student.roll);
    const presentCell = element("td", "", String(present));
    const absentCell = element("td", "", String(absent));
    const rateCell = element("td", "", `${studentRate}%`);
    const statusCell = document.createElement("td");
    statusCell.append(element("span", `status-badge ${studentRate < threshold ? "status-risk" : "status-good"}`, studentRate < threshold ? "Below limit" : "On track"));
    row.append(nameCell, rollCell, presentCell, absentCell, rateCell, statusCell);
    list.append(row);
  });
  byId("reports-empty").hidden = validRecords.length > 0;
}

function renderAll() {
  renderDashboard();
  renderStudents();
  renderAttendance();
  renderReports();
}

function openStudentDialog(student = null) {
  const form = byId("student-form");
  form.reset();
  byId("student-id").value = student?.id ?? "";
  byId("dialog-title").textContent = student ? "Edit student" : "Add student";
  byId("save-student").textContent = student ? "Save changes" : "Save student";
  byId("form-error").textContent = "";
  if (student) {
    byId("student-name").value = student.name;
    byId("student-roll").value = student.roll;
    byId("student-department").value = student.department;
    byId("student-semester").value = student.semester;
    byId("student-section").value = student.section;
  }
  byId("student-dialog").showModal();
  byId("student-name").focus();
}

function deleteStudent(student) {
  if (!window.confirm(`Delete ${student.name}? Their saved attendance records will also be removed.`)) return;
  try {
    studentStore.deleteStudent(student.id);
    attendanceStore.removeStudentRecords(student.id);
    renderAll();
    showToast(`${student.name} was deleted.`);
  } catch (error) {
    handleError(error);
    renderAll();
  }
}

function markAll(status) {
  const date = selectedDate();
  try {
    studentStore.listStudents().forEach((student) => attendanceStore.setStatus(student.id, date, status));
    renderAll();
    showToast(`All students marked ${status}.`);
  } catch (error) {
    handleError(error);
    renderAll();
  }
}

function exportCsv() {
  const records = attendanceStore.recordsForPeriod(byId("report-period").value);
  const studentsById = new Map(studentStore.listStudents().map((student) => [student.id, student]));
  const rows = records.filter((record) => studentsById.has(record.studentId)).map((record) => {
    const student = studentsById.get(record.studentId);
    return [record.date, student.name, student.roll, student.department, student.semester, student.section, record.status];
  });
  if (!rows.length) {
    showToast("There are no attendance records to export for this period.");
    return;
  }
  const csv = [["Date", "Student name", "Roll number", "Department", "Semester", "Section", "Status"], ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-${byId("report-period").value === "month" ? today().slice(0, 7) : "all-time"}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Your attendance report was exported.");
}

function setThreshold(value) {
  const nextThreshold = Number(value);
  if (!Number.isInteger(nextThreshold) || nextThreshold < 0 || nextThreshold > 100) {
    showToast("Enter a whole-number attendance limit from 0 to 100.");
    byId("threshold-input").value = String(threshold);
    return;
  }
  try {
    storage.saveThreshold(nextThreshold);
    threshold = nextThreshold;
    renderReports();
    showToast(`Low attendance limit set to ${threshold}%.`);
  } catch (error) {
    handleError(error);
  }
}

function setView(name) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${name}-view`));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === name));
  const activeLink = document.querySelector(`.nav-link[data-view="${name}"]`);
  byId("page-name").textContent = activeLink?.textContent.trim() ?? "Overview";
  byId("sidebar").classList.remove("open");
}

function bindEvents() {
  document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", () => setView(link.dataset.view)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.go)));
  byId("mobile-menu").addEventListener("click", () => byId("sidebar").classList.toggle("open"));
  byId("add-student").addEventListener("click", () => openStudentDialog());
  byId("empty-add-student").addEventListener("click", () => openStudentDialog());
  byId("student-search").addEventListener("input", renderStudents);
  byId("department-filter").addEventListener("change", renderStudents);
  byId("attendance-date").addEventListener("change", () => {
    byId("dashboard-date").value = byId("attendance-date").value;
    renderAll();
  });
  byId("dashboard-date").addEventListener("change", () => {
    byId("attendance-date").value = byId("dashboard-date").value;
    renderAll();
  });
  byId("mark-all-present").addEventListener("click", () => markAll("present"));
  byId("mark-all-absent").addEventListener("click", () => markAll("absent"));
  byId("clear-attendance").addEventListener("click", () => {
    if (!window.confirm(`Clear all attendance for ${formatDate(selectedDate())}?`)) return;
    try {
      attendanceStore.removeDate(selectedDate());
      renderAll();
      showToast("Attendance for that date was cleared.");
    } catch (error) {
      handleError(error);
    }
  });
  byId("student-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = {
      name: byId("student-name").value,
      roll: byId("student-roll").value,
      department: byId("student-department").value,
      semester: byId("student-semester").value,
      section: byId("student-section").value,
    };
    if (Object.values(data).some((value) => !value.trim())) {
      byId("form-error").textContent = "Please complete every field.";
      return;
    }
    try {
      const id = byId("student-id").value;
      studentStore.saveStudent(data, id);
      byId("student-dialog").close();
      renderAll();
      showToast(id ? "Student details updated." : "Student added to your class.");
    } catch (error) {
      byId("form-error").textContent = error instanceof Error ? error.message : "The student could not be saved.";
    }
  });
  [byId("close-dialog"), byId("cancel-dialog")].forEach((button) => button.addEventListener("click", () => byId("student-dialog").close()));
  byId("report-period").addEventListener("change", renderReports);
  byId("threshold-input").addEventListener("change", (event) => setThreshold(event.target.value));
  byId("threshold-edit").addEventListener("click", () => {
    setView("reports");
    byId("threshold-input").focus();
  });
  byId("export-csv").addEventListener("click", exportCsv);
}

function initialize() {
  const currentDate = today();
  byId("today-label").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  byId("attendance-date").value = currentDate;
  byId("dashboard-date").value = currentDate;
  bindEvents();
  renderAll();
}

try {
  initialize();
} catch (error) {
  console.error(error);
  document.body.replaceChildren(element("main", "empty-state", error instanceof Error ? error.message : "The app could not load saved data."));
}
