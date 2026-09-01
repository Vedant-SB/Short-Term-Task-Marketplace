# Short-Term Task Marketplace

## Overview

Short-Term Task Marketplace is a production-oriented MERN Stack web application that connects companies with students, freelancers, and professionals through a structured short-term hiring workflow.

The platform enables companies to post paid tasks, receive applications, select suitable candidates, manage project execution, handle revisions, review completed work, and maintain long-term records of collaborations. Individuals can discover opportunities, apply for tasks, submit deliverables, build their portfolio, and establish credibility through verified reviews.

The application follows a complete workflow similar to modern freelance platforms while focusing on short-duration projects ranging from three to seven days.

---

## Key Features

### Authentication and Authorization

* JWT-based authentication
* Secure password hashing using bcrypt
* Role-based authorization
* Protected routes
* Persistent login using local storage
* Automatic logout on unauthorized requests

### Company Features

* Register and login
* Create tasks
* Edit and delete open tasks
* View all applicants
* Accept a single applicant
* Extend application deadlines
* Extend submission deadlines
* Request revisions
* Mark tasks as completed
* Review individuals
* Company dashboard
* Public profile viewing

### Individual Features

* Register and login
* Browse available tasks
* Apply for tasks
* Withdraw applications
* Submit completed work
* Resubmit after revision requests
* Review companies
* Individual dashboard
* Portfolio generation
* Public profile viewing

---

## Workflow

```
Task Created
      │
      ▼
Applications Open
      │
      ▼
Applications Received
      │
      ▼
Applicant Selected
      │
      ▼
Task In Progress
      │
      ▼
Work Submitted
      │
      ├────────────► Revision Requested
      │                   │
      │                   ▼
      │              Resubmission
      │
      ▼
Task Completed
      │
      ▼
Company Review
      │
      ▼
Individual Review
```

---

## Deadline Management

The application manages two independent deadlines throughout the task lifecycle.

### Application Deadline

* Configured during task creation
* Controls the application period
* Can be extended by the company
* Visible only while the task remains open

### Submission Deadline

Activated only after an applicant is selected.

Tracks:

* Task start date
* Original deadline
* Current deadline

Supports:

* Deadline extensions
* Remaining days calculation
* Timeline tracking

---

## Review System

The platform implements a sequential review process.

1. Company submits a review after task completion.
2. Individual becomes eligible to review the company.
3. Reviews become permanent after submission.

This workflow encourages fair and verified feedback.

---

## Dashboards

### Company Dashboard

* Posted tasks
* Active projects
* Completed projects
* Pending reviews
* Task statistics
* Deadline tracking

### Individual Dashboard

* Applied tasks
* Accepted tasks
* Ongoing work
* Submission deadlines
* Portfolio
* Pending reviews

---

## Profile System

The platform supports both private and public profiles.

Each profile includes:

* Personal information
* Skills
* Ratings
* Portfolio
* Completed work
* Review history
* Platform statistics

Different layouts are provided for companies and individuals.

---

## Technology Stack

### Frontend

* React (Vite)
* React Router
* Axios
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JSON Web Tokens (JWT)
* bcrypt

---

## Project Structure

```
Short-Term-Task-Marketplace
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   └── package.json
│
└── README.md
```

---

## Security

The application incorporates several security measures.

* JWT authentication
* Password hashing with bcrypt
* Protected API endpoints
* Role-based access control
* Authorization middleware
* Request validation
* Secure password storage

---

## Current Capabilities

* Authentication system
* Role-based authorization
* Task management
* Application management
* Applicant selection workflow
* Submission workflow
* Revision workflow
* Review workflow
* Deadline management
* Company dashboard
* Individual dashboard
* Portfolio generation
* Public profiles
* Statistics
* Protected routes

---

## Future Enhancements

The following features are planned for future releases.

* Advanced search and filtering
* Real-time notifications
* In-app messaging
* File upload support
* Email notifications
* Payment gateway integration
* Administrative dashboard
* AI-powered task recommendations
* UI/UX redesign
* Progressive Web App support

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/<your-username>/Short-Term-Task-Marketplace.git
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Documentation

The repository is organized to support future documentation additions.

Planned documentation includes:

* System Architecture
* Database Schema
* API Documentation
* Deployment Guide
* User Guide

---

## Screenshots

Application screenshots will be added after the frontend redesign is completed.

---

## Deployment

Deployment configuration will be added after the production UI redesign.

Suggested deployment:

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas