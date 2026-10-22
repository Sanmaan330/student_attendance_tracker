import { storage } from "./storage.js";

let students = storage.getStudents();

function normalize(value) {
  return value.trim().replace(/\s+/g, " ");
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function listStudents() {
  return [...students].sort((a, b) => a.name.localeCompare(b.name));
}

function getStudent(id) {
  return students.find((student) => student.id === id) ?? null;
}

function saveStudent(data, id = "") {
  const student = {
    id: id || createId(),
    name: normalize(data.name),
    roll: normalize(data.roll),
    department: normalize(data.department),
    semester: normalize(data.semester),
    section: normalize(data.section),
  };

  const duplicate = students.find((item) =>
    item.roll.toLocaleLowerCase() === student.roll.toLocaleLowerCase() && item.id !== id
  );
  if (duplicate) throw new Error("That roll number is already assigned to another student.");

  const nextStudents = [...students];
  if (id) {
    const index = nextStudents.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("That student could not be found.");
    nextStudents[index] = student;
  } else {
    nextStudents.push(student);
  }
  storage.saveStudents(nextStudents);
  students = nextStudents;
  return student;
}

function deleteStudent(id) {
  const nextStudents = students.filter((student) => student.id !== id);
  if (nextStudents.length === students.length) return false;
  storage.saveStudents(nextStudents);
  students = nextStudents;
  return true;
}

export const studentStore = { listStudents, getStudent, saveStudent, deleteStudent };
