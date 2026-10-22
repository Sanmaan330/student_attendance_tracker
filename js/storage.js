const STORAGE_KEYS = {
  students: "attendly.students.v1",
  attendance: "attendly.attendance.v1",
  threshold: "attendly.threshold.v1",
};

function read(key, fallback) {
  let value;
  try {
    value = localStorage.getItem(key);
  } catch (error) {
    console.error(`Could not access saved data for ${key}.`, error);
    throw new Error("Browser storage could not be accessed. Check your browser privacy settings.");
  }
  if (value === null) return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Could not read saved data for ${key}.`, error);
    throw new Error("Saved data could not be read. Please check browser storage.");
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save data for ${key}.`, error);
    throw new Error("Changes could not be saved. Check that browser storage is available.");
  }
}

export const storage = {
  getStudents: () => {
    const students = read(STORAGE_KEYS.students, []);
    if (!Array.isArray(students) || students.some((student) =>
      !student || ["id", "name", "roll", "department", "semester", "section"].some((field) => typeof student[field] !== "string")
    )) {
      throw new Error("Saved student data has an invalid format.");
    }
    return students;
  },
  saveStudents: (students) => write(STORAGE_KEYS.students, students),
  getAttendance: () => {
    const attendance = read(STORAGE_KEYS.attendance, []);
    if (!Array.isArray(attendance) || attendance.some((record) =>
      !record || typeof record.studentId !== "string" || typeof record.date !== "string" ||
      !["present", "absent"].includes(record.status)
    )) {
      throw new Error("Saved attendance data has an invalid format.");
    }
    return attendance;
  },
  saveAttendance: (attendance) => write(STORAGE_KEYS.attendance, attendance),
  getThreshold: () => {
    const threshold = Number(read(STORAGE_KEYS.threshold, 75));
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100) {
      throw new Error("Saved attendance limit is invalid. Please clear the saved limit and reload.");
    }
    return threshold;
  },
  saveThreshold: (threshold) => write(STORAGE_KEYS.threshold, threshold),
};
