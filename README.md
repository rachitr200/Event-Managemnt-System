event-management-system/
├── index.html              # Main HTML file
├── styles.css              # Stylesheet
├── app.js                  # Application entry point
├── models/
│   ├── EventModel.js       # Event data model
│   └── AuthModel.js        # Authentication & user model
├── views/
│   └── EventView.js        # View component
├── controllers/
│   └── EventController.js  # Controller component
├── components/
│   └── UserManagement.js   # User database management
└── README.md               # This documentation# Event Management System - MVC Architecture
A complete web-based Event Management System built using the Model-View-Controller (MVC) architecture pattern. This application allows users to create, view, edit, and delete community events with user authentication and persistent storage.
🏗️ Architecture Overview
This project demonstrates the MVC (Model-View-Controller) architectural pattern with clear separation of concerns:
Model Layer

EventModel.js: Manages event data and business logic
AuthModel.js: Handles user authentication and session management
Database: Uses localStorage to simulate persistent database storage

View Layer

EventView.js: Manages UI rendering and user interactions
index.html: Main HTML structure
styles.css: Complete styling and responsive design

Controller Layer

EventController.js: Coordinates between Model and View
app.js: Application initialization and configuration

📁 File Structure
event-management-system/
├── index.html              # Main HTML file
├── styles.css              # Stylesheet
├── app.js                  # Application entry point
├── models/
│   ├── EventModel.js       # Event data model
│   └── AuthModel.js        # Authentication model
├── views/
│   └── EventView.js        # View component
├── controllers/
│   └── EventController.js  # Controller component
└── README.md               # This documentation
