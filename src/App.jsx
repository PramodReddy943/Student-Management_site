import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/students";

function App() {
    const [students, setStudents] = useState([]);

    const [form, setForm] = useState({
        name: "",
        age: "",
        course: "",
        marks: ""
    });

    const [editingName, setEditingName] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [loading, setLoading] = useState(false);

    async function getStudents() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load students.");
            }

            const data = await response.json();
            setStudents(data);
        } catch (error) {
            showMessage(
                "Cannot connect to the server. Check MongoDB and Node.js.",
                "error"
            );
        }
    }

    useEffect(() => {
        getStudents();
    }, []);

    function showMessage(text, type = "success") {
        setMessage(text);
        setMessageType(type);
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function resetForm() {
        setForm({
            name: "",
            age: "",
            course: "",
            marks: ""
        });

        setEditingName(null);
    }

    // EDIT: Fill form with selected student's details
    function handleEdit(student) {
        setForm({
            name: student.name,
            age: String(student.age),
            course: student.course || "",
            marks: String(student.marks)
        });

        setEditingName(student.name);
        setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // ADD or UPDATE
    async function handleSubmit(event) {
        event.preventDefault();

        const student = {
            name: form.name.trim(),
            age: Number(form.age),
            course: form.course.trim(),
            marks: Number(form.marks)
        };

        if (
            !student.name ||
            !student.course ||
            form.age === "" ||
            form.marks === ""
        ) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (!/^[a-zA-Z ]+$/.test(student.name)) {
            showMessage("Name must contain only letters and spaces.", "error");
            return;
        }

        if (!/^[a-zA-Z ]+$/.test(student.course)) {
            showMessage("Course must contain only letters and spaces.", "error");
            return;
        }

        if (!Number.isInteger(student.age) ||
            student.age < 18 || student.age > 30) {
            showMessage("Age must be between 18 and 30.", "error");
            return;
        }

        if (!Number.isInteger(student.marks) ||
            student.marks < 0 || student.marks > 100) {
            showMessage("Marks must be between 0 and 100.", "error");
            return;
        }

        const isEditing = editingName !== null;

        const url = isEditing
            ? `${API_URL}/${encodeURIComponent(editingName)}`
            : API_URL;

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Request failed.");
            }

            showMessage(
                isEditing
                    ? "Student updated successfully!"
                    : "Student added successfully!",
                "success"
            );

            resetForm();
            await getStudents();
        } catch (error) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    }

    // DELETE
    async function handleDelete(name) {
        if (!window.confirm(`Delete ${name}?`)) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(name)}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Delete failed.");
            }

            if (editingName === name) {
                resetForm();
            }

            showMessage("Student deleted successfully!", "success");
            await getStudents();
        } catch (error) {
            showMessage(error.message, "error");
        }
    }

    return (
        <div className="app-container">
            <header className="hero">
                <div className="hero-icon">🎓</div>

                <p className="eyebrow">STUDENT RECORDS PORTAL</p>

                <h1>Student Management System</h1>

                <p className="hero-description">
                    Manage student details, update marks, and maintain
                    records in one place.
                </p>

                <div className="hero-stats">
                    <div className="stat-card">
                        <span className="stat-number">{students.length}</span>
                        <span className="stat-label">Total Students</span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-number">4</span>
                        <span className="stat-label">Student Fields</span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-number">CRUD</span>
                        <span className="stat-label">Operations</span>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <section className="panel">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">STUDENT DETAILS</p>

                            <h2>
                                {editingName ? "Edit Student" : "Add New Student"}
                            </h2>

                            <p className="section-description">
                                {editingName
                                    ? `Editing ${editingName}'s details`
                                    : "Enter the student's information below."}
                            </p>
                        </div>

                        <span className="heading-icon">
                            {editingName ? "✏️" : "＋"}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Kumar"
                                    pattern="[a-zA-Z ]+"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    id="age"
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    min="18"
                                    max="30"
                                    step="1"
                                    placeholder="e.g. 20"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="course">Course / Branch</label>
                                <input
                                    id="course"
                                    name="course"
                                    value={form.course}
                                    onChange={handleChange}
                                    placeholder="e.g. CSE"
                                    pattern="[a-zA-Z ]+"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="marks">Marks</label>
                                <input
                                    id="marks"
                                    type="number"
                                    name="marks"
                                    value={form.marks}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="1"
                                    placeholder="0–100"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Please wait..."
                                    : editingName
                                    ? "✓ Update Student"
                                    : "＋ Add Student"}
                            </button>

                            {editingName && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        resetForm();
                                        setMessage("");
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {message && (
                        <div className={`message ${messageType}`} role="status">
                            {message}
                        </div>
                    )}
                </section>

                <section className="panel">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">DATABASE RECORDS</p>
                            <h2>Student Directory</h2>

                            <p className="section-description">
                                View, edit, and manage student records.
                            </p>
                        </div>

                        <span className="record-count">
                            {students.length} records
                        </span>
                    </div>

                    {students.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📚</div>
                            <h3>No students found</h3>
                            <p>Add a student using the form above.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Age</th>
                                        <th>Course</th>
                                        <th>Marks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map((student) => (
                                        <tr
                                            key={student._id || student.name}
                                            className={
                                                editingName === student.name
                                                    ? "editing-row"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                <div className="student-identity">
                                                    <div className="avatar">
                                                        {student.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <span className="student-name">
                                                        {student.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>{student.age}</td>

                                            <td>
                                                <span className="course-badge">
                                                    {student.course || "—"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="marks-value">
                                                    {student.marks}
                                                </span>
                                                <span className="marks-total">
                                                    /100
                                                </span>
                                            </td>

                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        disabled={editingName !== null}
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        ✏ Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(student.name)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            <footer className="footer">
                Student Management System · React · Node.js · MongoDB
            </footer>
        </div>
    );
}

export default App;