/**
 * AuthModel.js - Authentication Model
 * Handles user authentication and session management
 */

class AuthModel {
    constructor() {
        // Load users from localStorage or initialize with default users
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.nextUserId = this.getNextUserId();
    }

    /**
     * Load users from localStorage
     * @returns {Array} Array of users
     */
    loadUsers() {
        try {
            const saved = localStorage.getItem('users');
            if (saved) {
                return JSON.parse(saved);
            } else {
                // Initialize with default users if no users exist
                const defaultUsers = [
                    { 
                        id: 1,
                        username: 'admin', 
                        password: 'password', 
                        role: 'admin',
                        email: 'admin@eventmanager.com',
                        fullName: 'System Administrator',
                        phone: '+1-555-0100',
                        createdAt: new Date().toISOString()
                    },
                    { 
                        id: 2,
                        username: 'user', 
                        password: '123456', 
                        role: 'user',
                        email: 'user@eventmanager.com',
                        fullName: 'Demo User',
                        phone: '+1-555-0101',
                        createdAt: new Date().toISOString()
                    }
                ];
                this.saveUsers(defaultUsers);
                return defaultUsers;
            }
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    /**
     * Save users to localStorage
     * @param {Array} users - Array of users to save
     */
    saveUsers(users = null) {
        try {
            const usersToSave = users || this.users;
            localStorage.setItem('users', JSON.stringify(usersToSave));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    /**
     * Get next available user ID
     * @returns {number} Next available ID
     */
    getNextUserId() {
        return this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    }

    /**
     * Load current user from localStorage
     * @returns {Object|null} Current user object or null
     */
    loadCurrentUser() {
        try {
            const saved = localStorage.getItem('currentUser');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading current user:', error);
            return null;
        }
    }

    /**
     * Save current user to localStorage
     * @param {Object} user - User object to save
     */
    saveCurrentUser(user) {
        try {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUser = user;
        } catch (error) {
            console.error('Error saving current user:', error);
        }
    }

    /**
     * Authenticate user with username and password
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Object|null} User object if authentication successful, null otherwise
     */
    authenticate(username, password) {
        // Input validation
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Find user with matching credentials
        const user = this.users.find(u => 
            u.username.toLowerCase() === username.trim().toLowerCase() && 
            u.password === password &&
            u.isActive !== false
        );

        if (user) {
            // Update last login time
            user.lastLogin = new Date().toISOString();
            this.saveUsers();

            // Create session user object (without password)
            const sessionUser = {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                loginTime: new Date().toISOString(),
                lastLogin: user.lastLogin
            };

            this.saveCurrentUser(sessionUser);
            return sessionUser;
        }

        return null;
    }

    /**
     * Get user profile by ID
     * @param {number} userId - User ID
     * @returns {Object|null} User profile without password
     */
    getUserProfile(userId) {
        const user = this.users.find(u => u.id === parseInt(userId));
        if (user) {
            const { password, ...userProfile } = user;
            return userProfile;
        }
        return null;
    }

    /**
     * Update user profile
     * @param {number} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Object|null} Updated user profile
     */
    updateUserProfile(userId, updateData) {
        const userIndex = this.users.findIndex(u => u.id === parseInt(userId));
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        const user = this.users[userIndex];

        // Check if email is being changed and if it's already taken
        if (updateData.email && updateData.email !== user.email) {
            if (this.users.find(u => u.email.toLowerCase() === updateData.email.toLowerCase() && u.id !== userId)) {
                throw new Error('Email address already in use');
            }
            
            if (!this.validateEmailFormat(updateData.email)) {
                throw new Error('Please enter a valid email address');
            }
        }

        // Validate phone if provided
        if (updateData.phone && !this.validatePhoneFormat(updateData.phone)) {
            throw new Error('Please enter a valid phone number');
        }

        // Update allowed fields
        const allowedFields = ['fullName', 'email', 'phone'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                this.users[userIndex][field] = updateData[field].trim();
            }
        });

        this.users[userIndex].updatedAt = new Date().toISOString();
        this.saveUsers();

        // Update current user session if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
            const { password, ...userProfile } = this.users[userIndex];
            this.saveCurrentUser({
                ...this.currentUser,
                ...userProfile
            });
        }

        const { password, ...userProfile } = this.users[userIndex];
        return userProfile;
    }

    /**
     * Get all registered users (for admin)
     * @returns {Array} Array of users without passwords
     */
    getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }

        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Get user statistics
     * @returns {Object} User statistics
     */
    getUserStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.isActive !== false).length;
        const adminUsers = this.users.filter(u => u.role === 'admin').length;
        const recentUsers = this.users.filter(u => {
            const createdDate = new Date(u.createdAt);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return createdDate > oneWeekAgo;
        }).length;

        return {
            totalUsers,
            activeUsers,
            adminUsers,
            regularUsers: totalUsers - adminUsers,
            recentUsers
        };
    }

    /**
     * Log out current user
     */
    logout() {
        try {
            localStorage.removeItem('currentUser');
            this.currentUser = null;
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} True if authenticated, false otherwise
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get current authenticated user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if current user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} True if user has role, false otherwise
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    /**
     * Check if current user is admin
     * @returns {boolean} True if user is admin, false otherwise
     */
    isAdmin() {
        return this.hasRole('admin');
    }

    /**
     * Validate user session (check if session is still valid)
     * @returns {boolean} True if session is valid, false otherwise
     */
    validateSession() {
        if (!this.currentUser) {
            return false;
        }

        // In a real application, you might check session expiry, token validity, etc.
        // For this demo, we'll assume sessions are always valid if user exists
        return true;
    }

    /**
     * Change user password (for demo purposes)
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {boolean} True if password changed successfully, false otherwise
     */
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        // Find the user in the users array
        const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
        
        if (userIndex === -1) {
            return false;
        }

        // Verify current password
        if (this.users[userIndex].password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }

        // Update password
        this.users[userIndex].password = newPassword;
        
        // In a real application, you would save this to the database
        return true;
    }

    /**
     * Get user by username (admin function)
     * @param {string} username - Username to search for
     * @returns {Object|null} User object (without password) or null
     */
    getUserByUsername(username) {
        if (!this.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }

        const user = this.users.find(u => u.username === username);
        
        if (user) {
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    /**
     * Get all users (admin function)
     * @returns {Array} Array of users without passwords
     */
    getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }

        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Object} Created user object (without password)
     */
    registerUser(userData) {
        // Validate required fields
        if (!userData.username || !userData.password || !userData.email || !userData.fullName) {
            throw new Error('Username, password, email, and full name are required');
        }

        // Validate username format
        if (userData.username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
            throw new Error('Username can only contain letters, numbers, and underscores');
        }

        // Check if username already exists
        if (this.users.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
            throw new Error('Username already exists');
        }

        // Check if email already exists
        if (this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            throw new Error('Email address already registered');
        }

        // Validate email format
        if (!this.validateEmailFormat(userData.email)) {
            throw new Error('Please enter a valid email address');
        }

        // Validate password strength
        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Validate phone number if provided
        if (userData.phone && !this.validatePhoneFormat(userData.phone)) {
            throw new Error('Please enter a valid phone number');
        }

        // Create new user
        const newUser = {
            id: this.nextUserId++,
            username: userData.username.trim(),
            password: userData.password, // In production, this should be hashed
            role: 'user', // Default role for new registrations
            email: userData.email.trim().toLowerCase(),
            fullName: userData.fullName.trim(),
            phone: userData.phone ? userData.phone.trim() : '',
            createdAt: new Date().toISOString(),
            isActive: true,
            lastLogin: null
        };

        // Add to users array
        this.users.push(newUser);
        this.saveUsers();

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
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
     * Validate phone format
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    validatePhoneFormat(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
}
