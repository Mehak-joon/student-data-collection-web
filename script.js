/**
 * EduPortal Student Data Collection Script
 * Features:
 * - Mandatory JavaScript validation ensuring Email field is not empty before submission
 * - Real-time input validation & instant error clearing
 * - LocalStorage persistence for enrolled student records
 * - Toast notification system for intuitive user feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const studentForm = document.getElementById('studentForm');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const courseSelect = document.getElementById('course');
  const resetBtn = document.getElementById('resetBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  // Error Message Containers
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const courseError = document.getElementById('courseError');

  // Record Display Elements
  const recordsList = document.getElementById('recordsList');
  const emptyState = document.getElementById('emptyState');
  const recordCountBadge = document.getElementById('recordCount');

  // Toast Elements
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  // Theme Toggle Elements
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const THEME_STORAGE_KEY = 'eduportal_theme';

  // Initialize theme from saved preference or default light
  initTheme();

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeLabel) themeLabel.textContent = 'Dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeLabel) themeLabel.textContent = 'Light';
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    applyTheme(savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
      const targetTheme = isCurrentlyLight ? 'dark' : 'light';
      applyTheme(targetTheme);
      localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
      showToast('Theme Changed', `Switched to ${targetTheme === 'light' ? 'Light' : 'Dark'} mode.`, 'info');
    });
  }

  // Confirmation Modal Elements
  const confirmModal = document.getElementById('confirmModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalIconWrapper = document.getElementById('modalIconWrapper');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  let pendingModalAction = null;

  /**
   * Generic handler to show a warning/confirmation popup
   */
  function openConfirmModal({ title, message, iconType = 'warning', confirmText = 'Confirm', confirmBtnClass = 'btn-primary', onConfirm }) {
    modalTitle.textContent = title;
    modalDesc.innerHTML = message;
    modalConfirmBtn.textContent = confirmText;
    modalConfirmBtn.className = `btn ${confirmBtnClass}`;

    // Apply icon type styling
    modalIconWrapper.className = `modal-icon-wrapper icon-${iconType}`;
    if (iconType === 'danger' || iconType === 'warning') {
      modalIconWrapper.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `;
    } else {
      modalIconWrapper.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    pendingModalAction = onConfirm;
    confirmModal.classList.add('active');
  }

  function closeConfirmModal() {
    confirmModal.classList.remove('active');
    pendingModalAction = null;
  }

  modalCancelBtn.addEventListener('click', closeConfirmModal);
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
  });

  modalConfirmBtn.addEventListener('click', () => {
    if (typeof pendingModalAction === 'function') {
      const actionToExecute = pendingModalAction;
      closeConfirmModal();
      actionToExecute();
    } else {
      closeConfirmModal();
    }
  });

  // Local storage state
  const STORAGE_KEY = 'eduportal_students';
  let students = loadStudents();

  // Initial render
  renderRecords();

  /* ==========================================================================
     Validation Logic
     ========================================================================== */

  /**
   * Validates form inputs before submission.
   * STRICT REQUIREMENT: Validate that the Email field is not empty before submitting.
   */
  function validateForm() {
    let isValid = true;
    clearErrors();

    const fullNameValue = fullNameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const courseValue = courseSelect.value.trim();

    // 1. Name validation
    if (!fullNameValue) {
      showError(fullNameInput, nameError, 'Please enter the student\'s full name.');
      isValid = false;
    } else if (fullNameValue.length < 2) {
      showError(fullNameInput, nameError, 'Name must contain at least 2 characters.');
      isValid = false;
    } else {
      showSuccess(fullNameInput);
    }

    // 2. Email Validation (MANDATORY REQUIREMENT: Must not be empty)
    if (!emailValue) {
      showError(emailInput, emailError, 'Email field cannot be empty. Please enter an email address.');
      isValid = false;
    } else if (!isValidEmail(emailValue)) {
      showError(emailInput, emailError, 'Please enter a valid email format (e.g., student@domain.com).');
      isValid = false;
    } else {
      showSuccess(emailInput);
    }

    // 3. Course validation
    if (!courseValue) {
      showError(courseSelect, courseError, 'Please select a course for enrollment.');
      isValid = false;
    } else {
      showSuccess(courseSelect);
    }

    return isValid;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showError(inputEl, errorEl, message) {
    const formGroup = inputEl.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('has-error');
      formGroup.classList.remove('has-success');
    }
    errorEl.textContent = message;
  }

  function showSuccess(inputEl) {
    const formGroup = inputEl.closest('.form-group');
    if (formGroup) {
      formGroup.classList.remove('has-error');
      formGroup.classList.add('has-success');
    }
  }

  function clearErrors() {
    [fullNameInput, emailInput, courseSelect].forEach((inputEl) => {
      const formGroup = inputEl.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('has-error', 'has-success');
      }
    });
    nameError.textContent = '';
    emailError.textContent = '';
    courseError.textContent = '';
  }

  // Real-time clearance of validation errors when user types or changes value
  emailInput.addEventListener('input', () => {
    if (emailInput.value.trim() !== '') {
      emailInput.closest('.form-group').classList.remove('has-error');
      emailError.textContent = '';
    }
  });

  fullNameInput.addEventListener('input', () => {
    if (fullNameInput.value.trim() !== '') {
      fullNameInput.closest('.form-group').classList.remove('has-error');
      nameError.textContent = '';
    }
  });

  courseSelect.addEventListener('change', () => {
    if (courseSelect.value !== '') {
      courseSelect.closest('.form-group').classList.remove('has-error');
      courseError.textContent = '';
    }
  });

  /* ==========================================================================
     Form Submission Handler
     ========================================================================== */
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Validation Error', 'Please complete all required fields correctly.', 'error');
      // Focus on the email input if it caused the error
      if (!emailInput.value.trim()) {
        emailInput.focus();
      }
      return;
    }

    const studentName = fullNameInput.value.trim();
    const studentEmail = emailInput.value.trim();
    const studentCourse = courseSelect.value;

    // Show Warning / Confirmation Popup before Saving with Colorful Badges
    openConfirmModal({
      title: 'Confirm Student Enrollment',
      message: `Are you sure you want to save and register <span class="badge badge-primary">${escapeHtml(studentName)}</span> (<span class="badge badge-neutral">${escapeHtml(studentEmail)}</span>) for the <span class="badge ${getCourseBadgeClass(studentCourse)}">${escapeHtml(studentCourse)}</span> program?`,
      iconType: 'info',
      confirmText: 'Save Student',
      confirmBtnClass: 'btn-primary',
      onConfirm: () => {
        const newStudent = {
          id: Date.now().toString(),
          name: studentName,
          email: studentEmail,
          course: studentCourse,
          timestamp: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };

        students.unshift(newStudent);
        saveStudents(students);
        renderRecords();

        // Reset Form & show success notification
        studentForm.reset();
        clearErrors();
        showToast('Student Enrolled!', `${newStudent.name} was successfully registered.`, 'success');
      }
    });
  });

  // Reset Button Handler with Warning Popup
  resetBtn.addEventListener('click', () => {
    const hasData = fullNameInput.value || emailInput.value || courseSelect.value;
    if (!hasData) {
      showToast('Form Empty', 'There are no entered values to reset.', 'info');
      return;
    }

    openConfirmModal({
      title: 'Reset Form Fields?',
      message: 'Are you sure you want to reset all input fields? Any unsaved data will be permanently cleared.',
      iconType: 'warning',
      confirmText: 'Yes, Reset',
      confirmBtnClass: 'btn-danger',
      onConfirm: () => {
        studentForm.reset();
        clearErrors();
        showToast('Form Reset', 'All input fields have been cleared.', 'info');
      }
    });
  });

  // Clear All Records Handler with Warning Popup
  clearAllBtn.addEventListener('click', () => {
    if (students.length === 0) return;

    openConfirmModal({
      title: 'Clear Entire Registry?',
      message: `Are you sure you want to delete all ${students.length} student records? This cannot be undone.`,
      iconType: 'danger',
      confirmText: 'Delete All',
      confirmBtnClass: 'btn-danger',
      onConfirm: () => {
        students = [];
        saveStudents(students);
        renderRecords();
        showToast('Registry Cleared', 'All enrolled student records have been removed.', 'info');
      }
    });
  });

  /* ==========================================================================
     Records Rendering & LocalStorage Management
     ========================================================================== */
  function renderRecords() {
    recordsList.innerHTML = '';
    const totalCount = students.length;
    recordCountBadge.textContent = `${totalCount} ${totalCount === 1 ? 'Student' : 'Students'}`;

    if (totalCount === 0) {
      emptyState.style.display = 'flex';
      recordsList.style.display = 'none';
      clearAllBtn.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    recordsList.style.display = 'flex';
    clearAllBtn.style.display = 'inline-block';

    students.forEach((student) => {
      const li = document.createElement('li');
      li.className = 'record-item';

      // Get initials
      const initials = student.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'ST';

      li.innerHTML = `
        <div style="display: flex; align-items: center; min-width: 0; flex: 1;">
          <div class="record-avatar">${initials}</div>
          <div class="record-info">
            <h4 class="record-name" title="${student.name}">${escapeHtml(student.name)}</h4>
            <p class="record-email" title="${student.email}">${escapeHtml(student.email)}</p>
            <span class="badge ${getCourseBadgeClass(student.course)}" style="margin-top: 6px;">${escapeHtml(student.course)}</span>
          </div>
        </div>
        <button class="record-delete-btn" data-id="${student.id}" title="Delete record" aria-label="Delete ${student.name}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Attach delete listener
      const deleteBtn = li.querySelector('.record-delete-btn');
      deleteBtn.addEventListener('click', () => {
        deleteStudent(student.id, student.name);
      });

      recordsList.appendChild(li);
    });
  }

  function deleteStudent(id, name) {
    openConfirmModal({
      title: 'Delete Student Record?',
      message: `Are you sure you want to delete the student record for <span class="badge badge-rose">${escapeHtml(name)}</span>? This action cannot be reversed.`,
      iconType: 'danger',
      confirmText: 'Delete Student',
      confirmBtnClass: 'btn-danger',
      onConfirm: () => {
        students = students.filter((item) => item.id !== id);
        saveStudents(students);
        renderRecords();
        showToast('Record Deleted', `Removed record for ${name}.`, 'info');
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCourseBadgeClass(course) {
    if (!course) return 'badge-primary';
    if (course.includes('Computer Science')) return 'badge-primary';
    if (course.includes('Artificial Intelligence')) return 'badge-purple';
    if (course.includes('Software')) return 'badge-emerald';
    if (course.includes('Cybersecurity')) return 'badge-rose';
    if (course.includes('Cloud')) return 'badge-cyan';
    if (course.includes('Business')) return 'badge-amber';
    return 'badge-primary';
  }

  function loadStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load students from localStorage', e);
      return [];
    }
  }

  function saveStudents(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  function showToast(title, message, type = 'success') {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toast.className = `toast toast-${type} show`;
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Toast icon SVG based on type
    if (type === 'success') {
      toastIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else if (type === 'error') {
      toastIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
    } else {
      toastIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }
});
