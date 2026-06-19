# Short-Term Task Marketplace

## Overview

Short-Term Task Marketplace is a MERN Stack web application that connects companies with students, freelancers, and professionals for short-duration skill-based work.

Many organizations have small tasks that do not justify hiring a full-time employee or intern. At the same time, students and professionals are constantly looking for practical experience, portfolio projects, and paid opportunities. This platform aims to bridge that gap by providing a marketplace where companies can post short-term tasks and individuals can apply, complete work, receive reviews, and build a verified portfolio.

The project focuses on implementing a complete marketplace workflow rather than just basic CRUD operations.

## Core Workflow

A company creates a task and specifies the required skills, budget, duration, and deliverables. Interested individuals can browse available tasks, apply for them, and wait for selection. The company can review applicants and select the most suitable candidate. Once selected, the task moves into progress. The individual completes the work and submits it through the platform. The company reviews the submission, marks the task as completed, and both parties can leave reviews. Completed projects then become part of the individual's portfolio.

## Features

### Authentication and Authorization

The platform supports two main user roles:

**Company**

* Company Name
* Website
* Industry
* Email
* Password

**Individual**

* Student
* Freelancer
* Professional

Individual profiles include:

* Name
* Skills
* Bio
* GitHub Profile

Additional fields are supported based on user type.

Authentication features include:

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* Role-Based Access Control
* Profile Endpoint

### Task Management

Companies can:

* Create Tasks
* Edit Tasks
* Delete Tasks
* View Their Own Tasks

Each task contains:

* Title
* Description
* Category
* Skills Required
* Budget
* Duration
* Deliverables
* Eligibility Criteria

Task lifecycle:

Open → In Progress → Under Review → Completed

### Task Discovery

Individuals can:

* Browse Available Tasks
* Search Tasks
* Filter Tasks

Supported filters:

* Category
* Skills
* Budget Range
* Duration

### Application System

Individuals can apply to open tasks.

Features include:

* Duplicate Application Prevention
* Eligibility Validation
* Task Status Validation

Companies can:

* View Applicants
* Accept One Applicant

When an applicant is selected:

* Task status changes to In Progress
* Selected application becomes Accepted
* All remaining applications are automatically rejected

### Task Workspace

Once selected for a task, the individual can:

* Submit Work
* Add GitHub Repository Links
* Add Submission Notes

The company can:

* Review the Submission
* Mark the Task as Completed

### Reviews and Ratings

After a task is completed:

* Companies can review individuals
* Individuals can review companies

Each review contains:

* Rating (1–5)
* Comment

The system prevents duplicate reviews and ensures that reviews can only be submitted for completed tasks.

### Portfolio

Completed projects automatically appear in the user's portfolio.

Portfolio information is generated dynamically using completed tasks and reviews instead of maintaining a separate portfolio collection.

Portfolio entries display:

* Project Title
* Company Name
* Description
* Skills Used
* Budget
* Duration
* Submission Link
* Rating
* Review Comment
* Completion Date

### Dashboard Analytics

Company Dashboard:

* Tasks Posted
* Tasks Completed
* Open Tasks
* In Progress Tasks
* Applications Received

Individual Dashboard:

* Applications Sent
* Accepted Applications
* Completed Tasks
* Average Rating

## Tech Stack

### Frontend (Planned)

* React
* React Router
* Axios
* Context API

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs

### Database

* MongoDB Atlas
* Mongoose

## Security Features

The backend includes:

* Password Hashing
* JWT Authentication
* Protected Routes
* Role-Based Authorization
* Ownership Validation
* Duplicate Prevention
* Controlled Task Updates
* Task Lifecycle Enforcement

## Current Project Status

The backend MVP is complete and includes:

* Authentication and Authorization
* Task Management
* Search and Filters
* Application System
* Applicant Selection Workflow
* Task Submission Workflow
* Reviews and Ratings
* Portfolio System
* Dashboard Analytics

Frontend development is the next phase of the project.

## Future Enhancements

Planned features after frontend completion include:

* Admin Panel
* Skill Matching System
* Advanced Analytics
* File Upload Support
* Deployment and Production Improvements

## Project Goal

The main goal of this project is to build a complete marketplace workflow where a company can post a task, an individual can apply, the company can select an applicant, work can be submitted and reviewed, and completed projects can become part of a verified portfolio.

The project demonstrates authentication, authorization, database design, marketplace workflows, task lifecycle management, reviews, analytics, and portfolio generation using the MERN stack.