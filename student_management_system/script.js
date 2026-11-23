const STORAGE_KEY = "studentManagementRecords";

const studentForm = document.getElementById("studentForm");
const studentIdInput = document.getElementById("studentId");
const fullNameInput = document.getElementById("fullName");
const matricNumberInput = document.getElementById("matricNumber");
const departmentInput = document.getElementById("department");
const levelInput = document.getElementById("level");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("studentTableBody");
const studentCount = document.getElementById("studentCount");
const formTitle = document.getElementById("formTitle");
const formMode = document.getElementById("formMode");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formMessage = document.getElementById("formMessage");

let students = loadStudents();

function loadStudents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Could not read saved student records:", error);
    return [];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#c43c48" : "#16845b";
}

function resetForm() {
  studentForm.reset();
  studentIdInput.value = "";
  formTitle.textContent = "Register a student";
  formMode.textContent = "NEW RECORD";
  submitBtn.textContent = "Register student";
  cancelEditBtn.classList.add("hidden");
  showMessage("");
}

function getFormData() {
  return {
    id: studentIdInput.value || String(Date.now()),
    name: fullNameInput.value.trim(),
    matricNumber: matricNumberInput.value.trim(),
    department: departmentInput.value.trim(),
    level: levelInput.value,
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim()
  };
}

studentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const student = getFormData();
  const editing = Boolean(studentIdInput.value);

  const duplicate = students.some(item =>
    item.matricNumber.toLowerCase() === student.matricNumber.toLowerCase() &&
    item.id !== student.id
  );

  if (duplicate) {
    showMessage("That matric number is already registered.", true);
    matricNumberInput.focus();
    return;
  }

  if (editing) {
    students = students.map(item => item.id === student.id ? student : item);
    showMessage("Student information updated successfully.");
  } else {
    students.push(student);
    showMessage("Student registered successfully.");
  }

  saveStudents();
  renderStudents(searchInput.value);
  resetForm();
});

function renderStudents(searchTerm = "") {
  const query = searchTerm.trim().toLowerCase();
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(query) ||
    student.matricNumber.toLowerCase().includes(query) ||
    student.department.toLowerCase().includes(query)
  );

  studentCount.textContent = students.length;
  tableBody.replaceChildren();

  if (filteredStudents.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-state";
    cell.textContent = students.length === 0
      ? "No students registered yet. Add your first student above."
      : "No matching students found.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  filteredStudents.forEach(student => {
    const row = document.createElement("tr");

    const studentCell = document.createElement("td");
    const name = document.createElement("div");
    name.className = "student-name";
    name.textContent = student.name;
    const email = document.createElement("div");
    email.className = "student-email";
    email.textContent = student.email;
    studentCell.append(name, email);

    row.append(
      studentCell,
      createCell(student.matricNumber),
      createCell(student.department)
    );

    const levelCell = document.createElement("td");
    const level = document.createElement("span");
    level.className = "level-pill";
    level.textContent = student.level;
    levelCell.appendChild(level);
    row.appendChild(levelCell);

    const contactCell = document.createElement("td");
    contactCell.textContent = student.phone;
    row.appendChild(contactCell);

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editStudent(student.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteStudent(student.id));

    actions.append(editButton, deleteButton);
    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });
}

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function editStudent(id) {
  const student = students.find(item => item.id === id);
  if (!student) return;

  studentIdInput.value = student.id;
  fullNameInput.value = student.name;
  matricNumberInput.value = student.matricNumber;
  departmentInput.value = student.department;
  levelInput.value = student.level;
  emailInput.value = student.email;
  phoneInput.value = student.phone;

  formTitle.textContent = "Update student information";
  formMode.textContent = "EDITING RECORD";
  submitBtn.textContent = "Save changes";
  cancelEditBtn.classList.remove("hidden");
  showMessage("");
  window.scrollTo({ top: 0, behavior: "smooth" });
  fullNameInput.focus();
}

function deleteStudent(id) {
  const student = students.find(item => item.id === id);
  if (!student) return;

  const confirmed = window.confirm(`Delete the record for ${student.name}?`);
  if (!confirmed) return;

  students = students.filter(item => item.id !== id);
  saveStudents();

  if (studentIdInput.value === id) resetForm();
  renderStudents(searchInput.value);
}

searchInput.addEventListener("input", () => {
  renderStudents(searchInput.value);
});

cancelEditBtn.addEventListener("click", resetForm);

renderStudents();
