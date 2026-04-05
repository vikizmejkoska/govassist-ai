# GovAssist AI

GovAssist AI is a full-stack web application for simplifying access to public administrative services through digital workflows and AI-assisted guidance.

The platform enables citizens to browse services, understand required documentation, submit requests, upload supporting files, and track request progress in one centralized system. It also supports officers in request processing and administrators in managing services and roles. :contentReference[oaicite:1]{index=1}

## Overview

GovAssist AI is designed to improve the efficiency, accessibility, and usability of administrative procedures by providing a structured digital platform for:
- citizens
- officers
- administrators

The system also includes an AI support component for helping users understand procedures and documentation requirements. :contentReference[oaicite:2]{index=2}

## Core Features

### Citizen
- Register and log in
- View and edit profile
- Browse administrative services
- View service details
- Submit requests
- Upload documents
- Track request status
- View request history
- Receive notifications

### Officer
- View incoming requests
- Review and process requests
- Update request status
- Add comments
- Request additional documents

### Administrator
- Add, edit, and delete services
- Manage user roles

### AI Support
- Recommend required documentation
- Answer common procedural questions
- Assist users through an AI chatbot interface :contentReference[oaicite:3]{index=3}

## Request Statuses

- Submitted
- In Progress
- Additional Documents Required
- Approved
- Rejected :contentReference[oaicite:4]{index=4}

## Non-Functional Goals

- Simple and intuitive user interface
- Secure authentication and authorization
- Responsive design
- Cross-device compatibility
- Secure document handling
- Maintainable and scalable architecture
- Accurate and consistent data handling :contentReference[oaicite:5]{index=5}

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- Maven
- Bean Validation
- Lombok

### Frontend
- Planned separately in the `frontend/` module

### Tools
- Git
- GitHub
- IntelliJ IDEA
- Jira
- Figma

## Project Structure

```text
govassist-ai/
├── backend/      # Spring Boot backend
├── frontend/     # Frontend application
└── README.md