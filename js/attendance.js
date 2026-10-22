import { storage } from "./storage.js";

let records = storage.getAttendance();

function listRecords() {
  return [...records];
}

function getStatus(studentId, date) {
  return records.find((record) => record.studentId === studentId && record.date === date)?.status ?? "";
}

function setStatus(studentId, date, status) {
  if (!studentId || !date || !["present", "absent"].includes(status)) {
    throw new Error("Choose a valid attendance status.");
  }
  const existingIndex = records.findIndex((record) => record.studentId === studentId && record.date === date);
  const nextRecords = [...records];
  const record = { studentId, date, status };
  if (existingIndex === -1) nextRecords.push(record);
  else nextRecords[existingIndex] = record;
  storage.saveAttendance(nextRecords);
  records = nextRecords;
}

function removeDate(date) {
  const nextRecords = records.filter((record) => record.date !== date);
  storage.saveAttendance(nextRecords);
  records = nextRecords;
}

function removeStudentRecords(studentId) {
  const nextRecords = records.filter((record) => record.studentId !== studentId);
  storage.saveAttendance(nextRecords);
  records = nextRecords;
}

function recordsForPeriod(period) {
  if (period === "all") return listRecords();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${year}-${month}-`;
  return records.filter((record) => record.date.startsWith(prefix));
}

export const attendanceStore = {
  listRecords,
  getStatus,
  setStatus,
  removeDate,
  removeStudentRecords,
  recordsForPeriod,
};
