/**
 * UserManagement.js - User Database Management Component
 * Handles user database viewing and management (Admin only)
 */

class UserManagement {
    constructor(authModel, view) {
        this.authModel = authModel;
        this.view = view;
    }

    /**
     * Render user management interface (Admin only)
     */
    renderUserManagement() {
        if (!this.authModel.isAdmin()) {
            return '<div class="access-denied">Access denied. Admin privileges required.</div>';
        }

        const users = this.authModel.getAllUsers();
        const stats = this.authModel.getUserStats();

        return `
            <div class="user-management-section">
                <h2>👥 User Database Management</h2>
                
                <!-- User Statistics -->
                <div class="user-stats">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalUsers}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.activeUsers}</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.adminUsers}</div>
                        <div class="stat-label">Admin Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.recentUsers}</div>
                        <div class="stat-label">New This Week</div>
                    </div>
                </div>

                <!-- User List -->
                <div class="user-list">
                    <h3>Registered Users</h3>
                    <div class="user-table-container">
                        <table class="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Registration Date</th>
                                    <th>Last Login</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(user => this.renderUserRow(user)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Export Options -->
                <div class="export-options">
                    <h3>Export User Data</h3>
                    <button class="btn btn-secondary" onclick="userManagement.exportUsers('json')">
                        📄 Export as JSON
                    </button>
                    <button class="btn btn-secondary" onclick="userManagement.exportUsers('csv')">
                        📊 Export as CSV
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render individual user row
     * @param {Object} user - User object
     * @returns {string} HTML for user row
     */
    renderUserRow(user) {
        const registrationDate = new Date(user.createdAt).toLocaleDateString();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
        const status = user.isActive !== false ? 'Active' : 'Inactive';
        const roleClass = user.role === 'admin' ? 'role-admin' : 'role-user';
        const statusClass = user.isActive !== false ? 'status-active' : 'status-inactive';

        return `
            <tr class="user-row">
                <td>${user.id}</td>
                <td class="username">${this.escapeHtml(user.username)}</td>
                <td>${this.escapeHtml(user.fullName)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td>${user.phone ? this.escapeHtml(user.phone) : '-'}</td>
                <td><span class="role-badge ${roleClass}">${user.role}</span></td>
                <td>${registrationDate}</td>
                <td>${lastLogin}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    }

    /**
     * Export users data
     * @param {string} format - Export format ('json' or 'csv')
     */
    exportUsers(format) {
        try {
            const users = this.authModel.getAllUsers();
            let data;
            let filename;
            let mimeType;

            if (format === 'csv') {
                data = this.convertUsersToCSV(users);
                filename = `users_database_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
            } else {
                data = JSON.stringify(users, null, 2);
                filename = `users_database_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            }

            this.downloadFile(data, filename, mimeType);
            this.view.showSuccess(`User database exported successfully as ${format.toUpperCase()}`);

        } catch (error) {
            console.error('Export error:', error);
            this.view.showError('Failed to export user data');
        }
    }

    /**
     * Convert users array to CSV format
     * @param {Array} users - Users array
     * @returns {string} CSV data
     */
    convertUsersToCSV(users) {
        const headers = [
            'ID', 'Username', 'Full Name', 'Email', 'Phone', 'Role', 
            'Registration Date', 'Last Login', 'Status'
        ].join(',');

        const rows = users.map(user => [
            user.id,
            `"${user.username}"`,
            `"${user.fullName}"`,
            `"${user.email}"`,
            `"${user.phone || ''}"`,
            user.role,
            `"${new Date(user.createdAt).toLocaleDateString()}"`,
            `"${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}"`,
            user.isActive !== false ? 'Active' : 'Inactive'
        ].join(','));

        return headers + '\n' + rows.join('\n');
    }

    /**
     * Download file
     * @param {string} data - File data
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
    }

    /**
     * Get user activity report
     * @returns {Object} User activity data
     */
    getUserActivityReport() {
        const users = this.authModel.getAllUsers();
        const now = new Date();
        
        const activeToday = users.filter(user => {
            if (!user.lastLogin) return false;
            const lastLogin = new Date(user.lastLogin);
            return now - lastLogin < 24 * 60 * 60 * 1000; // 24 hours
        });

        const activeThisWeek = users.filter(user => {
            if (!user.lastLogin) return false;
            const lastLogin = new Date(user.lastLogin);
            return now - lastLogin < 7 * 24 * 60 * 60 * 1000; // 7 days
        });

        const newThisMonth = users.filter(user => {
            const createdDate = new Date(user.createdAt);
            return createdDate.getMonth() === now.getMonth() && 
                   createdDate.getFullYear() === now.getFullYear();
        });

        return {
            totalUsers: users.length,
            activeToday: activeToday.length,
            activeThisWeek: activeThisWeek.length,
            newThisMonth: newThisMonth.length,
            neverLoggedIn: users.filter(user => !user.lastLogin).length
        };
    }

    /**
     * Search users by various criteria
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered users
     */
    searchUsers(searchTerm) {
        const users = this.authModel.getAllUsers();
        const term = searchTerm.toLowerCase();

        return users.filter(user => 
            user.username.toLowerCase().includes(term) ||
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.phone && user.phone.includes(term))
        );
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get CSS styles for user management
     * @returns {string} CSS styles
     */
    getStyles() {
        return `
            <style>
                .user-management-section {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    margin-bottom: 30px;
                }

                .user-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .stat-number {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .user-table-container {
                    overflow-x: auto;
                    margin-bottom: 20px;
                }

                .user-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .user-table th,
                .user-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #e1e5e9;
                }

                .user-table th {
                    background: #f8f9fa;
                    font-weight: 600;
                    color: #333;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 0.5px;
                }

                .user-table tr:hover {
                    background: #f8f9fa;
                }

                .username {
                    font-weight: 600;
                    color: #4facfe;
                }

                .role-badge,
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .role-admin {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                }

                .role-user {
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    color: white;
                }

                .status-active {
                    background: linear-gradient(135deg, #4caf50, #45a049);
                    color: white;
                }

                .status-inactive {
                    background: linear-gradient(135deg, #9e9e9e, #757575);
                    color: white;
                }

                .export-options {
                    padding-top: 20px;
                    border-top: 1px solid #e1e5e9;
                }

                .export-options h3 {
                    margin-bottom: 15px;
                    color: #333;
                }

                .access-denied {
                    background: #ffebee;
                    color: #c62828;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .user-stats {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .stat-number {
                        font-size: 2rem;
                    }
                    
                    .user-table th,
                    .user-table td {
                        padding: 8px 10px;
                        font-size: 0.85rem;
                    }
                }
            </style>
        `;
    }
}
