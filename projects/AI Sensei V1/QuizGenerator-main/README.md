# 🥋 AI Sensei (Prototype – v1)

> [!WARNING]
> **Archived Project**
> 
> This repository contains the original prototype of AI Sensei. It has been superseded by a complete architectural rewrite (v2) and is retained for learning, comparison, and historical context only.

👉 Current version: AI Sensei v2 (Clean Architecture Rewrite)

## 📌 Purpose of v1

Version 1 was built as a rapid proof of concept to validate the core idea:

*   AI-generated programming quizzes
*   Basic user authentication
*   CRUD operations for quiz history
*   Frontend consumption via React

The focus was on speed and experimentation, not long-term maintainability.

## ⚙️ Technical Overview

*   **Framework**: ASP.NET Core (.NET 8)
*   **Language**: C#
*   **Database**: SQLite
*   **ORM**: Entity Framework Core
*   **Frontend**: React (early prototype)
*   **Architecture**: Monolithic / Tightly Coupled

## 🚧 Known Limitations

This version has several intentional shortcomings that led to its rewrite:

*   **Tightly Coupled**: Business logic and infrastructure concerns are mixed.
*   **Poor Separation of Concerns**: The monolithic design makes it hard to isolate components.
*   **Simplistic Security**: The security model is basic and not suitable for production.
*   **Embedded Logic**: AI-related logic is embedded directly in services, making it difficult to test or swap.
*   **Low Testability**: The tight coupling makes unit testing and extension difficult.

These constraints became more apparent as the project's scope grew, necessitating a complete rewrite.

## 🔄 Architectural Evolution

Version 2 was created to address these limitations by introducing a **Clean Architecture** with:

*   Clear, interface-driven design
*   Strong domain boundaries
*   Proper JWT authentication and data isolation
*   Testable, extensible AI integration
*   A production-ready project structure

This repository remains as a valuable reference point for architectural evolution.

## 🗄️ Project Status

*   **Status**: Archived
*   **Development**: No active development.
*   **Support**: No production support.

## 📄 License

This project is licensed under the MIT License.
