/**
 * EventModel.js - Model for Event Management
 * Handles all event-related data operations (CRUD)
 */

class EventModel {
    constructor() {
        this.events = this.loadEvents();
        this.nextId = this.getNextId();
    }

    /**
     * Load events from localStorage (simulating database)
     * @returns {Array} Array of events
     */
    loadEvents() {
        try {
            const saved = localStorage.getItem('events');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    }

    /**
     * Save events to localStorage (simulating database persistence)
     */
    saveEvents() {
        try {
            localStorage.setItem('events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving events:', error);
        }
    }

    /**
     * Get next available ID for new events
     * @returns {number} Next available ID
     */
    getNextId() {
        return this.events.length > 0 ? Math.max(...this.events.map(e => e.id)) + 1 : 1;
    }

    /**
     * Add new event to the database
     * @param {Object} eventData - Event data object
     * @returns {Object} Created event object
     */
    addEvent(eventData) {
        // Validate required fields
        if (!eventData.title || !eventData.description || !eventData.date || 
            !eventData.time || !eventData.location) {
            throw new Error('All fields are required');
        }

        const event = {
            id: this.nextId++,
            title: eventData.title.trim(),
            description: eventData.description.trim(),
            date: eventData.date,
            time: eventData.time,
            location: eventData.location.trim(),
            createdBy: eventData.createdBy || 'Unknown',
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        
        this.events.push(event);
        this.saveEvents();
        return event;
    }

    /**
     * Get all events from the database
     * @returns {Array} Array of all events
     */
    getAllEvents() {
        return [...this.events]; // Return a copy to prevent direct mutation
    }

    /**
     * Get event by ID
     * @param {number} id - Event ID
     * @returns {Object|null} Event object or null if not found
     */
    getEventById(id) {
        return this.events.find(event => event.id === parseInt(id)) || null;
    }

    /**
     * Update existing event
     * @param {number} id - Event ID
     * @param {Object} eventData - Updated event data
     * @returns {Object|null} Updated event object or null if not found
     */
    updateEvent(id, eventData) {
        const index = this.events.findIndex(event => event.id === parseInt(id));
        
        if (index === -1) {
            return null;
        }

        // Validate required fields
        if (!eventData.title || !eventData.description || !eventData.date || 
            !eventData.time || !eventData.location) {
            throw new Error('All fields are required');
        }

        // Update the event
        this.events[index] = {
            ...this.events[index],
            title: eventData.title.trim(),
            description: eventData.description.trim(),
            date: eventData.date,
            time: eventData.time,
            location: eventData.location.trim(),
            updatedAt: new Date().toISOString()
        };

        this.saveEvents();
        return this.events[index];
    }

    /**
     * Delete event by ID
     * @param {number} id - Event ID
     * @returns {Object|null} Deleted event object or null if not found
     */
    deleteEvent(id) {
        const index = this.events.findIndex(event => event.id === parseInt(id));
        
        if (index === -1) {
            return null;
        }

        const deletedEvent = this.events.splice(index, 1)[0];
        this.saveEvents();
        return deletedEvent;
    }

    /**
     * Get events by date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Array} Filtered events
     */
    getEventsByDateRange(startDate, endDate) {
        return this.events.filter(event => {
            return event.date >= startDate && event.date <= endDate;
        });
    }

    /**
     * Get events by creator
     * @param {string} createdBy - Creator username
     * @returns {Array} Filtered events
     */
    getEventsByCreator(createdBy) {
        return this.events.filter(event => event.createdBy === createdBy);
    }

    /**
     * Search events by title or description
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered events
     */
    searchEvents(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.events.filter(event => 
            event.title.toLowerCase().includes(term) || 
            event.description.toLowerCase().includes(term)
        );
    }

    /**
     * Get total number of events
     * @returns {number} Total event count
     */
    getEventCount() {
        return this.events.length;
    }

    /**
     * Clear all events (for testing purposes)
     */
    clearAllEvents() {
        this.events = [];
        this.nextId = 1;
        this.saveEvents();
    }
}
