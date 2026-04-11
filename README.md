# 🚀 F1 Pulse — Secure Formula 1 Analytics Platform

F1 Pulse is a full-stack analytics platform designed to visualize and analyze Formula 1 data with a **secure, scalable backend architecture** and a modern frontend dashboard.

---

## 🧠 Overview

F1 Pulse enables users to explore:

* 🏎️ Driver and constructor standings
* 📊 Race performance analytics
* 📈 Data-driven visual insights
* 🤖 AI-based predictions (upcoming)

The project focuses on **real-world backend engineering practices**, including authentication, authorization, and secure API design.

---

## ⚙️ Tech Stack

### 🔹 Frontend

* React (Vite)
* Tailwind CSS
* Recharts

### 🔹 Backend

* Spring Boot
* PostgreSQL
* Spring Security
* JWT Authentication
* Swagger (API Documentation)

### 🔹 AI / ML (Planned)

* Python (scikit-learn)
* Regression models for predictions

---

## 🔐 Backend Features (Core Strength)

* 🔑 **JWT-based Authentication**
* 🛡️ **Role-Based Access Control (ADMIN / USER)**
* 📦 **DTO-based architecture (clean API design)**
* ✅ **Request validation using @Valid**
* ⚠️ **Global error handling with structured responses**
* 🔍 **Swagger UI for API testing and documentation**
* 🚫 **Secure data handling (no password exposure)**

---

## 🚀 API Endpoints

| Endpoint                  | Description                |
| ------------------------- | -------------------------- |
| `POST /api/auth/register` | Register new user          |
| `POST /api/auth/login`    | Login and get JWT token    |
| `GET /api/user/me`        | Get current logged-in user |
| `GET /api/admin/users`    | Admin-only user listing    |

---

## 📄 API Documentation

Swagger UI available at:

```
http://localhost:9090/swagger-ui/index.html
```

---

## 🏗️ Architecture Highlights

* Layered backend architecture (Controller → Service → Repository)
* Stateless authentication using JWT
* Secure endpoint protection using Spring Security
* DTO pattern for request/response separation
* Clean error handling strategy for production readiness

---

## 📊 Frontend Features

* Interactive dashboard with charts and tables
* Driver standings visualization
* Points trend analytics
* Responsive UI with Tailwind CSS

---

## 🚀 Future Enhancements

* 🔴 Live F1 API integration
* 🤖 AI-based race predictions
* 📊 Advanced analytics & comparisons
* ⚡ Redis caching for performance
* ☁️ Full-stack deployment

---

## 🎯 Purpose

This project is built to:

* Demonstrate **real-world backend system design**
* Practice secure API development with Spring Boot
* Combine frontend visualization with backend intelligence
* Build a **production-style, portfolio-ready application**

---

## 📌 Status

* ✅ Backend — Completed (Core features + security)
* 🟡 Frontend — In Progress
* 🤖 AI Integration — Planned

---

## 💡 Key Takeaway

F1 Pulse is not just a dashboard — it is a **secure, scalable backend-driven system** designed with industry best practices.
