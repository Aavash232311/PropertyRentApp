# Property Rental Application

This is a full-stack property rental platform built using a modern distributed architecture. The project was developed as a potential startup concept, focusing on high-performance location-based searches and secure user management.

## Project Status Note
This repository contains recovered code from the original project. While some auxiliary work was lost, the core logic, API structure, and geolocation features are fully functional and serve as a demonstration of the application's architecture.

## Core Features

### 1. Advanced Search & Geolocation
- Location-Based Search: Uses the Haversine algorithm to calculate distances between users and properties.
- Map Integration: Leaflet and OpenStreetMap for interactive property visualization.
- High-Performance Queries: Custom geolocation APIs optimized for spatial data.

### 2. Identity & Security
- ASP.NET Identity: Full authentication and authorization system.
- Security Workflows: Includes email confirmation and password reset functionality.
- Role-Based Access Control (RBAC): Restriction of specific API endpoints and UI pages based on user roles (User/Admin).

### 3. Data & Management
- CRUD Operations: Full Create, Read, Update, and Delete capabilities for property listings.
- Dual-Layer Pagination: Efficient data handling implemented on both server-side and client-side.
- Admin Panel: A dedicated management interface for overseeing application data and users.
- ORM & Migrations: Entity Framework Core for database management.

## Technical Stack

- Orchestration: ASP.NET Aspire
- Backend: ASP.NET Core Web API
- Frontend: React with TypeScript
- Database/ORM: Entity Framework Core
- Mapping: Leaflet, OpenStreetMap
- Auth: ASP.NET Identity


This ensures accurate "near me" search results for users looking for rentals within a specific radius.

## UI/UX Highlights
- Reusable React Components: Modular design for consistency and maintainability.
- Responsive Design: Works across various screen sizes.
- Basic Bells and Whistles: Interactive UI elements and optimized page transitions.

