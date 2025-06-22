/**
 * EventView.js - View component for Event Management
 * Handles all UI rendering and user interface interactions
 */

class EventView {
    constructor() {
        this.initializeElements();
        this.editingId = null;
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.authSection = document.getElementById('authSection');
        this.mainSection = document.getElementById('mainSection');
        this.userInfo = document.getElementById('userInfo');
        this.currentUserSpan = document.getElementById('currentUser');
        this.eventForm = document.getElementById('eventForm');
        this.eventsList = document.getElementById('eventsList');
        
        // Auth form elements
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.registrationForm = document.getElementById('registrationForm');
        
        // Login form elements
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        
        // Signup form elements
        this.signupUsernameInput = document.getElementById('signupUsername');
        this.signupFullNameInput = document.getElementById('signupFullName');
        this.signupEmailInput = document.getElementById('signupEmail');
        this.signupPasswordInput = document.getElementById('signupPassword');
        this.signupConfirmPasswordInput = document.getElementById('signupConfirmPassword');
        this.signupPhoneInput = document.getElementById('signupPhone');
        this.agreeTermsInput = document.getElementById('agreeTerms');
        
        // Event form elements
        this.eventTitleInput = document.getElementById('eventTitle');
        this.eventDescriptionInput = document.getElementById('eventDescription');
        this.eventDateInput = document.getElementById('eventDate');
        this.eventTimeInput = document.getElementById('eventTime');
        this.eventLocationInput = document.getElementById('eventLocation');
    }

    /**
     * Show authentication section and hide main section
     */
    showAuthSection() {
        this.authSection.classList.remove('hidden');
        this.mainSection.classList.add('hidden');
        this.userInfo.classList.add('hidden');
        
        // Show login form by default
        this.showLoginForm();
    }

    /**
     * Show login form
     */
    showLoginForm() {
        if (this.loginForm && this.signupForm) {
            this.loginForm.classList.remove('hidden');
            this.signupForm.classList.add('hidden');
            this.clearLoginForm();
        }
    }

    /**
     * Show signup form
     */
    showSignupForm() {
        if (this.loginForm && this.signupForm) {
            this.loginForm.classList.add('hidden');
            this.signupForm.classList.remove('hidden');
            this.clearSignupForm();
        }
    }

    /**
     * Show main section and hide authentication section
     * @param {Object} user - Current user object
     */
    showMainSection(user) {
        this.authSection.classList.add('hidden');
        this.mainSection.classList.remove('hidden');
        this.userInfo.classList.remove('hidden');
        this.currentUserSpan.textContent = `${user.fullName || user.username} (${user.role})`;
        
        // Show user management button for admins
        const userManagementBtn = document.getElementById('userManagementBtn');
        if (userManagementBtn) {
            if (user.role === 'admin') {
                userManagementBtn.style.display = 'inline-block';
            } else {
                userManagementBtn.style.display = 'none';
            }
        }
        
        // Set minimum date to today
        this.setMinimumDate();
    }

    /**
     * Set minimum date for event date input to today
     */
    setMinimumDate() {
        const today = new Date().toISOString().split('T')[0];
        this.eventDateInput.min = today;
    }

    /**
     * Show login error message
     * @param {string} message - Error message to display
     */
    showLoginError(message = 'Invalid credentials! Please try again.') {
        this.showNotification(message, 'error');
    }

    /**
     * Show success message
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${this.escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    z-index: 1000;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease-out;
                    max-width: 400px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-success { background: linear-gradient(135deg, #4caf50, #45a049); }
                .notification-error { background: linear-gradient(135deg, #f44336, #da190b); }
                .notification-info { background: linear-gradient(135deg, #2196f3, #0b7dda); }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 15px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to document
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Clear login form
     */
    clearLoginForm() {
        if (this.usernameInput) this.usernameInput.value = '';
        if (this.passwordInput) this.passwordInput.value = '';
    }

    /**
     * Clear signup form
     */
    clearSignupForm() {
        if (this.registrationForm) {
            this.registrationForm.reset();
        }
    }

    /**
     * Clear event form
     */
    clearForm() {
        this.eventForm.reset();
        this.editingId = null;
        this.updateFormSubmitButton('Add Event');
    }

    /**
     * Update form submit button text
     * @param {string} text - Button text
     */
    updateFormSubmitButton(text) {
        const submitButton = this.eventForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = text;
        }
    }

    /**
     * Populate form with event data for editing
     * @param {Object} event - Event object
     */
    populateForm(event) {
        this.eventTitleInput.value = event.title;
        this.eventDescriptionInput.value = event.description;
        this.eventDateInput.value = event.date;
        this.eventTimeInput.value = event.time;
        this.eventLocationInput.value = event.location;
        
        this.editingId = event.id;
        this.updateFormSubmitButton('Update Event');
    }

    /**
     * Render events list
     * @param {Array} events - Array of event objects
     */
    renderEvents(events) {
        if (!events || events.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Sort events by date and time
        const sortedEvents = events.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });

        this.eventsList.innerHTML = sortedEvents.map(event => this.renderEventCard(event)).join('');
    }

    /**
     * Render single event card
     * @param {Object} event - Event object
     * @returns {string} HTML string for event card
     */
    renderEventCard(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = this.formatTime(event.time);
        const isUpcoming = new Date(`${event.date} ${event.time}`) > new Date();

        return `
            <div class="event-card ${isUpcoming ? 'upcoming' : 'past'}">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-description">${this.escapeHtml(event.description)}</div>
                
                <div class="event-details">
                    <div class="event-detail">
                        <strong>📅 Date:</strong><br>
                        ${formattedDate}
                    </div>
                    <div class="event-detail">
                        <strong>🕐 Time:</strong><br>
                        ${formattedTime}
                    </div>
                    <div class="event-detail">
                        <strong>📍 Location:</strong><br>
                        ${this.escapeHtml(event.location)}
                    </div>
                    <div class="event-detail">
                        <strong>👤 Created by:</strong><br>
                        ${this.escapeHtml(event.createdBy)}
                    </div>
                </div>
                
                ${event.updatedAt ? `
                    <div class="event-updated">
                        <small>Last updated: ${new Date(event.updatedAt).toLocaleDateString()}</small>
                    </div>
                ` : ''}
                
                <div class="event-actions">
                    <button class="btn btn-secondary" onclick="controller.editEvent(${event.id})" title="Edit Event">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" onclick="controller.deleteEvent(${event.id})" title="Delete Event">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state when no events exist
     */
    renderEmptyState() {
        this.eventsList.innerHTML = `
            <div class="empty-state">
                <h3>📅 No Events Yet</h3>
                <p>Create your first event using the form above!</p>
                <p>Start organizing your community events today.</p>
            </div>
        `;
    }

    /**
     * Format time from 24-hour to 12-hour format
     * @param {string} time - Time in HH:MM format
     * @returns {string} Formatted time string
     */
    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML string
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get form data from event form
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            title: this.eventTitleInput.value.trim(),
            description: this.eventDescriptionInput.value.trim(),
            date: this.eventDateInput.value,
            time: this.eventTimeInput.value,
            location: this.eventLocationInput.value.trim()
        };
    }

    /**
     * Get login data from login form
     * @returns {Object} Login data object
     */
    getLoginData() {
        return {
            username: this.usernameInput.value.trim(),
            password: this.passwordInput.value
        };
    }

    /**
     * Get signup data from signup form
     * @returns {Object} Signup data object
     */
    getSignupData() {
        return {
            username: this.signupUsernameInput.value.trim(),
            fullName: this.signupFullNameInput.value.trim(),
            email: this.signupEmailInput.value.trim(),
            password: this.signupPasswordInput.value,
            confirmPassword: this.signupConfirmPasswordInput.value,
            phone: this.signupPhoneInput.value.trim(),
            agreeTerms: this.agreeTermsInput.checked
        };
    }

    /**
     * Validate signup form data
     * @param {Object} signupData - Signup data to validate
     * @returns {Array} Array of validation errors
     */
    validateSignupData(signupData) {
        const errors = [];

        // Required fields
        if (!signupData.username) errors.push('Username is required');
        if (!signupData.fullName) errors.push('Full name is required');
        if (!signupData.email) errors.push('Email address is required');
        if (!signupData.password) errors.push('Password is required');
        if (!signupData.confirmPassword) errors.push('Please confirm your password');

        // Username validation
        if (signupData.username && signupData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (signupData.username && !/^[a-zA-Z0-9_]+$/.test(signupData.username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }

        // Email validation
        if (signupData.email && !this.validateEmailFormat(signupData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        if (signupData.password && signupData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        // Password confirmation
        if (signupData.password && signupData.confirmPassword && 
            signupData.password !== signupData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Terms agreement
        if (!signupData.agreeTerms) {
            errors.push('You must agree to the Terms of Service and Privacy Policy');
        }

        return errors;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if form is in editing mode
     * @returns {boolean} True if editing, false otherwise
     */
    isEditing() {
        return this.editingId !== null;
    }

    /**
     * Get ID of event being edited
     * @returns {number|null} Event ID or null
     */
    getEditingId() {
        return this.editingId;
    }

    /**
     * Scroll to event form
     */
    scrollToForm() {
        this.eventForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Validate form data
     * @param {Object} formData - Form data to validate
     * @returns {Array} Array of validation errors
     */
    validateFormData(formData) {
        const errors = [];

        if (!formData.title) errors.push('Event title is required');
        if (!formData.description) errors.push('Event description is required');
        if (!formData.date) errors.push('Event date is required');
        if (!formData.time) errors.push('Event time is required');
        if (!formData.location) errors.push('Event location is required');

        // Check if date is in the past
        const eventDateTime = new Date(`${formData.date} ${formData.time}`);
        const now = new Date();
        if (eventDateTime < now) {
            errors.push('Event date and time cannot be in the past');
        }

        return errors;
    }

    /**
     * Show form validation errors
     * @param {Array} errors - Array of error messages
     */
    showValidationErrors(errors) {
        if (errors.length > 0) {
            this.showError(errors.join('\n'));
        }
    }
}
