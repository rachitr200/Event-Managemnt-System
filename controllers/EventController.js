/**
 * EventController.js - Controller for Event Management
 * Handles user interactions and coordinates between Model and View
 */

class EventController {
    constructor() {
        this.eventModel = new EventModel();
        this.authModel = new AuthModel();
        this.view = new EventView();
        this.userManagement = new UserManagement(this.authModel, this.view);
        this.showingUserManagement = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Check if user is already authenticated
        if (this.authModel.isAuthenticated() && this.authModel.validateSession()) {
            this.view.showMainSection(this.authModel.getCurrentUser());
            this.loadEvents();
        } else {
            // Clear invalid session
            this.authModel.logout();
            this.view.showAuthSection();
        }

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Form submission for events
        this.view.eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEventSubmission();
        });

        // Registration form submission
        if (this.view.registrationForm) {
            this.view.registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserRegistration();
            });
        }

        // Enter key for login
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.authModel.isAuthenticated()) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.id === 'username' || activeElement.id === 'password')) {
                    this.login();
                }
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.init();
        });

        // Auto-refresh events every 30 seconds (for demo purposes)
        setInterval(() => {
            if (this.authModel.isAuthenticated()) {
                this.loadEvents();
            }
        }, 30000);
    }

    /**
     * Handle user login
     */
    login() {
        try {
            const loginData = this.view.getLoginData();
            
            // Validate input
            if (!loginData.username || !loginData.password) {
                this.view.showError('Please enter both username and password.');
                return;
            }

            // Attempt authentication
            const user = this.authModel.authenticate(loginData.username, loginData.password);
            
            if (user) {
                this.view.showSuccess(`Welcome back, ${user.fullName || user.username}!`);
                this.view.showMainSection(user);
                this.loadEvents();
                
                // Log successful login
                console.log(`User ${user.username} logged in successfully at ${new Date().toISOString()}`);
            } else {
                this.view.showLoginError('Invalid username or password. Please try again.');
                
                // Log failed login attempt
                console.log(`Failed login attempt for username: ${loginData.username} at ${new Date().toISOString()}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.view.showError('An error occurred during login. Please try again.');
        }
    }

    /**
     * Handle user logout
     */
    logout() {
        try {
            const currentUser = this.authModel.getCurrentUser();
            this.authModel.logout();
            this.view.showAuthSection();
            this.view.clearForm();
            
            if (currentUser) {
                this.view.showSuccess('You have been logged out successfully.');
                console.log(`User ${currentUser.username} logged out at ${new Date().toISOString()}`);
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.view.showError('An error occurred during logout.');
        }
    }

    /**
     * Show signup form
     */
    showSignupForm() {
        this.view.showSignupForm();
    }

    /**
     * Show login form
     */
    showLoginForm() {
        this.view.showLoginForm();
    }

    /**
     * Handle user registration
     */
    handleUserRegistration() {
        try {
            const signupData = this.view.getSignupData();
            
            // Client-side validation
            const validationErrors = this.view.validateSignupData(signupData);
            if (validationErrors.length > 0) {
                this.view.showValidationErrors(validationErrors);
                return;
            }

            // Register the user
            const newUser = this.authModel.registerUser(signupData);
            
            // Show success message
            this.view.showSuccess(`Welcome ${newUser.fullName}! Your account has been created successfully. Please log in with your credentials.`);
            
            // Switch to login form
            this.view.showLoginForm();
            
            // Pre-fill username in login form
            if (this.view.usernameInput) {
                this.view.usernameInput.value = newUser.username;
            }
            
            // Log successful registration
            console.log(`New user registered: ${newUser.username} (${newUser.email}) at ${new Date().toISOString()}`);
            
        } catch (error) {
            console.error('Registration error:', error);
            this.view.showError(error.message || 'Registration failed. Please try again.');
        }
    }

    /**
     * Handle event form submission (add/edit)
     */
    handleEventSubmission() {
        try {
            const formData = this.view.getFormData();
            
            // Validate form data
            const validationErrors = this.view.validateFormData(formData);
            if (validationErrors.length > 0) {
                this.view.showValidationErrors(validationErrors);
                return;
            }

            const currentUser = this.authModel.getCurrentUser();
            
            if (!currentUser) {
                this.view.showError('You must be logged in to perform this action.');
                return;
            }

            if (this.view.isEditing()) {
                // Update existing event
                this.updateEvent(this.view.getEditingId(), formData);
            } else {
                // Add new event
                this.addEvent(formData, currentUser);
            }
        } catch (error) {
            console.error('Event submission error:', error);
            this.view.showError('An error occurred while saving the event. Please try again.');
        }
    }

    /**
     * Add new event
     * @param {Object} formData - Event form data
     * @param {Object} currentUser - Current authenticated user
     */
    addEvent(formData, currentUser) {
        try {
            const eventData = {
                ...formData,
                createdBy: currentUser.username
            };
            
            const newEvent = this.eventModel.addEvent(eventData);
            
            this.view.showSuccess(`Event "${newEvent.title}" has been created successfully!`);
            this.view.clearForm();
            this.loadEvents();
            
            // Log event creation
            console.log(`Event created: ${newEvent.title} by ${currentUser.username} at ${new Date().toISOString()}`);
        } catch (error) {
            console.error('Add event error:', error);
            this.view.showError(error.message || 'Failed to create event. Please check your input and try again.');
        }
    }

    /**
     * Update existing event
     * @param {number} eventId - Event ID
     * @param {Object} formData - Updated event data
     */
    updateEvent(eventId, formData) {
        try {
            const updatedEvent = this.eventModel.updateEvent(eventId, formData);
            
            if (updatedEvent) {
                this.view.showSuccess(`Event "${updatedEvent.title}" has been updated successfully!`);
                this.view.clearForm();
                this.loadEvents();
                
                // Log event update
                const currentUser = this.authModel.getCurrentUser();
                console.log(`Event updated: ${updatedEvent.title} by ${currentUser.username} at ${new Date().toISOString()}`);
            } else {
                this.view.showError('Event not found. It may have been deleted by another user.');
                this.loadEvents(); // Refresh the list
            }
        } catch (error) {
            console.error('Update event error:', error);
            this.view.showError(error.message || 'Failed to update event. Please check your input and try again.');
        }
    }

    /**
     * Load and display events
     */
    loadEvents() {
        try {
            const events = this.eventModel.getAllEvents();
            this.view.renderEvents(events);
            
            // Update document title with event count
            document.title = `Event Management System (${events.length} events)`;
        } catch (error) {
            console.error('Load events error:', error);
            this.view.showError('Failed to load events. Please refresh the page.');
        }
    }

    /**
     * Edit event
     * @param {number} id - Event ID
     */
    editEvent(id) {
        try {
            const event = this.eventModel.getEventById(id);
            
            if (event) {
                this.view.populateForm(event);
                this.view.scrollToForm();
                
                // Log event edit action
                const currentUser = this.authModel.getCurrentUser();
                console.log(`Event edit started: ${event.title} by ${currentUser.username} at ${new Date().toISOString()}`);
            } else {
                this.view.showError('Event not found. It may have been deleted.');
                this.loadEvents(); // Refresh the list
            }
        } catch (error) {
            console.error('Edit event error:', error);
            this.view.showError('Failed to load event for editing.');
        }
    }

    /**
     * Delete event
     * @param {number} id - Event ID
     */
    deleteEvent(id) {
        try {
            const event = this.eventModel.getEventById(id);
            
            if (!event) {
                this.view.showError('Event not found. It may have already been deleted.');
                this.loadEvents();
                return;
            }

            // Confirm deletion
            const confirmMessage = `Are you sure you want to delete the event "${event.title}"?\n\nThis action cannot be undone.`;
            
            if (confirm(confirmMessage)) {
                const deletedEvent = this.eventModel.deleteEvent(id);
                
                if (deletedEvent) {
                    this.view.showSuccess(`Event "${deletedEvent.title}" has been deleted successfully.`);
                    this.loadEvents();
                    
                    // Clear form if we were editing this event
                    if (this.view.isEditing() && this.view.getEditingId() === id) {
                        this.view.clearForm();
                    }
                    
                    // Log event deletion
                    const currentUser = this.authModel.getCurrentUser();
                    console.log(`Event deleted: ${deletedEvent.title} by ${currentUser.username} at ${new Date().toISOString()}`);
                } else {
                    this.view.showError('Failed to delete event. Please try again.');
                }
            }
        } catch (error) {
            console.error('Delete event error:', error);
            this.view.showError('An error occurred while deleting the event.');
        }
    }

    /**
     * Cancel event editing
     */
    cancelEdit() {
        this.view.clearForm();
        this.view.showSuccess('Edit cancelled.');
    }

    /**
     * Toggle user management view (Admin only)
     */
    toggleUserManagement() {
        if (!this.authModel.isAdmin()) {
            this.view.showError('Access denied. Admin privileges required.');
            return;
        }

        const userManagementSection = document.getElementById('userManagementSection');
        const eventSection = document.querySelector('.event-section');

        if (this.showingUserManagement) {
            // Hide user management, show events
            userManagementSection.classList.add('hidden');
            if (eventSection) eventSection.classList.remove('hidden');
            this.showingUserManagement = false;
            
            // Update button text
            const btn = document.getElementById('userManagementBtn');
            if (btn) btn.textContent = '👥 Users';
            
            this.loadEvents();
        } else {
            // Show user management, hide events
            userManagementSection.classList.remove('hidden');
            if (eventSection) eventSection.classList.add('hidden');
            this.showingUserManagement = true;
            
            // Update button text
            const btn = document.getElementById('userManagementBtn');
            if (btn) btn.textContent = '📅 Events';
            
            this.loadUserManagement();
        }
    }

    /**
     * Load user management interface
     */
    loadUserManagement() {
        try {
            const userManagementSection = document.getElementById('userManagementSection');
            if (userManagementSection) {
                // Add styles if not already added
                if (!document.getElementById('user-management-styles')) {
                    const styleElement = document.createElement('div');
                    styleElement.id = 'user-management-styles';
                    styleElement.innerHTML = this.userManagement.getStyles();
                    document.head.appendChild(styleElement);
                }
                
                userManagementSection.innerHTML = this.userManagement.renderUserManagement();
                
                // Make userManagement available globally for onclick handlers
                window.userManagement = this.userManagement;
            }
        } catch (error) {
            console.error('Error loading user management:', error);
            this.view.showError('Failed to load user management interface.');
        }
    }

    /**
     * Search events (future enhancement)
     * @param {string} searchTerm - Search term
     */
    searchEvents(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                this.loadEvents();
                return;
            }

            const filteredEvents = this.eventModel.searchEvents(searchTerm.trim());
            this.view.renderEvents(filteredEvents);
            
            // Show search results message
            if (filteredEvents.length === 0) {
                this.view.showError(`No events found matching "${searchTerm}".`);
            } else {
                this.view.showSuccess(`Found ${filteredEvents.length} event(s) matching "${searchTerm}".`);
            }
        } catch (error) {
            console.error('Search events error:', error);
            this.view.showError('An error occurred while searching events.');
        }
    }

    /**
     * Filter events by date range (future enhancement)
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     */
    filterEventsByDateRange(startDate, endDate) {
        try {
            const filteredEvents = this.eventModel.getEventsByDateRange(startDate, endDate);
            this.view.renderEvents(filteredEvents);
            
            if (filteredEvents.length === 0) {
                this.view.showError('No events found in the selected date range.');
            } else {
                this.view.showSuccess(`Found ${filteredEvents.length} event(s) in the selected date range.`);
            }
        } catch (error) {
            console.error('Filter events error:', error);
            this.view.showError('An error occurred while filtering events.');
        }
    }

    /**
     * Get application statistics (for admin dashboard)
     * @returns {Object} Application statistics
     */
    getStatistics() {
        if (!this.authModel.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }

        const events = this.eventModel.getAllEvents();
        const users = this.authModel.getAllUsers();
        const currentDate = new Date();
        
        const upcomingEvents = events.filter(event => 
            new Date(`${event.date} ${event.time}`) > currentDate
        );
        
        const pastEvents = events.filter(event => 
            new Date(`${event.date} ${event.time}`) <= currentDate
        );

        return {
            totalEvents: events.length,
            upcomingEvents: upcomingEvents.length,
            pastEvents: pastEvents.length,
            totalUsers: users.length,
            eventsThisMonth: events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear();
            }).length
        };
    }

    /**
     * Export events data (future enhancement)
     * @param {string} format - Export format ('json', 'csv')
     * @returns {string} Exported data
     */
    exportEvents(format = 'json') {
        try {
            const events = this.eventModel.getAllEvents();
            
            if (format === 'csv') {
                const csvHeaders = 'Title,Description,Date,Time,Location,Created By,Created At\n';
                const csvData = events.map(event => 
                    `"${event.title}","${event.description}","${event.date}","${event.time}","${event.location}","${event.createdBy}","${event.createdAt}"`
                ).join('\n');
                
                return csvHeaders + csvData;
            } else {
                return JSON.stringify(events, null, 2);
            }
        } catch (error) {
            console.error('Export events error:', error);
            throw new Error('Failed to export events data.');
        }
    }
}
