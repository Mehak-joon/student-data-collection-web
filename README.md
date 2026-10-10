# 🎓 EduPortal - Student Information Management System

A modern, responsive, and aesthetically crafted web application for collecting and managing student enrollment data with real-time client-side verification, interactive warning dialogs, and a persistent theme switcher.

Built as part of **Task 2: Student Data Collection** using pure **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🚀 Key Features

### 1. Form Collection & Validation (Task 2 Core Requirement)
- **Student Information Fields:** Full Name, Email Address, and Course selection dropdown.
- **Strict JavaScript Email Validation:** Validates that the Email field is **not empty** and properly formatted before allowing submission.
- **Real-Time Input Feedback:** Error messages clear automatically as the user types.

### 2. Dual-Theme Support (Default Light Mode)
- **Light Theme (Warm Pearl & Clean Slate):** Clean, elevated white cards with subtle borders and clear contrast.
- **Dark Theme (Deep Obsidian & Royal Violet):** Glassmorphism cards with glowing ambient accents and indigo highlights.
- **Persistent Preferences:** The user's theme selection is stored in `localStorage` and remembered across sessions.
- **Intuitive Toggle Button:** Shows the target mode ("Dark" with a Moon icon when in light mode, and "Light" with a Sun icon when in dark mode).

### 3. Safety Confirmation & Warning Popups
- **Save / Enrollment Confirmation:** Displays a modal summarizing the student's name, email, and selected program with color-coded badges before saving.
- **Form Reset Warning:** Alerts the user before wiping active form inputs.
- **Delete Confirmation:** Prompts for confirmation before removing an individual student from the registry.
- **Registry Clear Warning:** Protects against accidental clearing of the entire student database.

### 4. Interactive Live Registry
- **Instant Student Cards:** Submitted records are displayed immediately with generated initials avatars and course badges.
- **Color-Coded Badges:** Each program (Computer Science, AI, Software Development, Cybersecurity, etc.) is assigned a distinct badge color.
- **Local Storage Persistence:** Records remain saved in the browser across page refreshes.

---

## 📁 File Structure

```text
student-data-collection-web/
├── index.html        # HTML5 semantic structure, form, modal dialog, and notifications
├── style.css         # CSS tokens, glassmorphism, responsive grid, and theme palettes
├── script.js         # Validation logic, modal controllers, theme engine, and storage
└── README.md         # Project documentation and brief explanation
```

---

## 🛠️ Technologies Used

- **HTML5:** Semantic elements (`<header>`, `<main>`, `<section>`, `<form>`, `<footer>`) with accessibility attributes (`aria-label`, `role="dialog"`).
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, Glassmorphism (`backdrop-filter`), keyframe animations, and micro-transitions.
- **Vanilla JavaScript (ES6+):** Event listeners, DOM manipulation, form validation, and `localStorage` API. No external dependencies or frameworks required.

---

## 💻 How to Run

1. Clone or open the project folder in your local machine:
   ```text
   c:\Users\hp\Desktop\student-data-collection-web
   ```
2. Double-click **`index.html`** or right-click and select **Open with Google Chrome** (or Microsoft Edge).
3. The application is completely client-side and requires no local server or build tools.

---

## 📖 Theoretical Reference: Client-Server Architecture (Task 1)

1. **Role of the Client (Browser):**
   - Renders the graphical user interface (HTML/CSS) and executes client-side scripts (JavaScript).
   - Validates user input before sending requests to minimize unnecessary server traffic.

2. **Role of the Server:**
   - Processes business logic, handles authentication, and queries database systems.
   - Responds to client requests using standardized protocols (HTTP/HTTPS) and formats (JSON, HTML).

3. **Data Flow:**
   - **Request:** Client sends an HTTP request (e.g., `POST /api/students` with form payload).
   - **Processing:** Server validates data, executes logic, and persists data to a database.
   - **Response:** Server returns an HTTP status code (e.g., `201 Created` or `400 Bad Request`) with a response payload.

4. **Real-World Example:**
   - **University Portal:** A student fills out an admissions form in the browser (client). The browser sends the details to the admissions API (server), which verifies eligibility against existing records in the database and returns an enrollment confirmation.
