/**
 * app.js - Application Entry Point
 * Initializes the Event Management System
 */

// Global controller instance
let controller;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize the MVC application
        controller = new EventController();
        
        // Log application startup
        console.log('Event Management System initialized successfully');
        console.log('MVC Architecture components loaded:');
        console.log('- Model: EventModel, AuthModel');
        console.log('- View: EventView');
        console.log('- Controller: EventController');
        
        // Add global error handler
        window.addEventListener('error', function(e) {
            console.error('Global error:', e.error);
            if (controller && controller.view) {
                controller.view.showError('An unexpected error occurred. Please refresh the page.');
            }
        });

        // Add unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
            if (controller && controller.view) {
                controller.view.showError('An unexpected error occurred. Please try again.');
            }
        });

        // Make controller available globally for onclick handlers
        window.controller = controller;
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #f44336;">
                <h1>Application Error</h1>
                <p>Failed to initialize the Event Management System.</p>
                <p>Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px;">
                    Refresh Page
                </button>
            </div>
        `;
    }
});

/**
 * Application configuration object
 */
const AppConfig = {
    name: 'Event Management System',
    version: '1.0.0',
    author: 'MVC Architecture Demo',
    description: 'A complete event management system built with MVC architecture',
    
    // Application settings
    settings: {
        autoRefreshInterval: 30000, // 30 seconds
        maxEventsPerPage: 20,
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h'
    },
    
    // Feature flags
    features: {
        searchEnabled: true,
        exportEnabled: true,
        notificationsEnabled: true,
        adminDashboard: true
    }
};

/**
 * Utility functions
 */
const AppUtils = {
    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Format time for display
     * @param {string} timeString - Time string (HH:MM)
     * @returns {string} Formatted time
     */
    formatTime: function(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes} ${ampm}`;
    },

    /**
     * Validate email format
     * @param {string} email - Email string
     * @returns {boolean} True if valid email
     */
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

/**
 * Development tools (only available in development mode)
 */
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.DevTools = {
        /**
         * Reset application data
         */
        resetData: function() {
            localStorage.clear();
            location.reload();
        },

        /**
         * Get application state
         */
        getState: function() {
            return {
                events: controller.eventModel.getAllEvents(),
                currentUser: controller.authModel.getCurrentUser(),
                isAuthenticated: controller.authModel.isAuthenticated()
            };
        },

        /**
         * Add sample events
         */
        addSampleEvents: function() {
            const sampleEvents = [
                {
                    title: 'Community Meeting',
                    description: 'Monthly community meeting to discuss local issues',
                    date: '2025-07-15',
                    time: '19:00',
                    location: 'Community Center',
                    createdBy: 'admin'
                },
                {
                    title: 'Summer Festival',
                    description: 'Annual summer festival with music, food, and activities',
                    date: '2025-08-20',
                    time: '10:00',
                    location: 'Central Park',
                    createdBy: 'admin'
                },
                {
                    title: 'Workshop: Web Development',
                    description: 'Learn the basics of web development with HTML, CSS, and JavaScript',
                    date: '2025-07-25',
                    time: '14:00',
                    location: 'Tech Hub',
                    createdBy: 'user'
                }
            ];

            sampleEvents.forEach(event => {
                controller.eventModel.addEvent(event);
            });

            controller.loadEvents();
            console.log('Sample events added successfully');
        },

        /**
         * Toggle debug mode
         */
        toggleDebug: function() {
            document.body.classList.toggle('debug-mode');
            console.log('Debug mode toggled');
        }
    };

    console.log('Development tools available: window.DevTools');
    console.log('Available commands:');
    console.log('- DevTools.resetData() - Reset all application data');
    console.log('- DevTools.getState() - Get current application state');
    console.log('- DevTools.addSampleEvents() - Add sample events');
    console.log('- DevTools.toggleDebug() - Toggle debug mode');
}

/**
 * Service Worker registration (for future PWA features)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker would be registered here for offline functionality
        console.log('Service Worker support detected (not implemented in this demo)');
    });
}

/**
 * Export configuration for testing
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppConfig,
        AppUtils
    };
}