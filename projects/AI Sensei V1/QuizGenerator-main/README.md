##🥋 AI Sensei (Prototype – v1)
#⚠️ Archived Project

This repository contains the original prototype of AI Sensei. It has been superseded by a complete architectural rewrite (v2) and is retained for learning, comparison, and historical context only.

👉 Current version: AI Sensei v2 (Clean Architecture Rewrite)

#📌 Purpose of v1
Version 1 was built as a rapid proof of concept to validate the core idea:

AI-generated programming quizzes
Basic user authentication
CRUD operations for quiz history
Frontend consumption via React
The focus was speed and experimentation, not long-term maintainability.

#⚙️ Technical Overview
Framework: ASP.NET Core (.NET 8)
Language: C#
Database: SQLite
ORM: Entity Framework Core
Frontend: React (early prototype)
Architecture: Monolithic / tightly coupled
#🚧 Known Limitations
This version has several intentional shortcomings that led to a rewrite:

Tightly coupled business logic and infrastructure
Limited separation of concerns
Simplistic security model
AI logic embedded directly in services
Difficult to test and extend cleanly
Not suitable for production use
These constraints became more apparent as the project grew.

#🔄 Why It Was Rewritten
Version 2 was created to address the architectural and security limitations of this prototype by introducing:

Clean, interface-driven architecture
Strong domain boundaries
Proper JWT authentication and data isolation
Testable, extensible AI integration
Production-ready project structure
This repository remains as a reference point for architectural evolution.

🗄️ Project Status
❌ No active development
❌ No production support
✅ Archived intentionally
📄 License
This project is licensed under the MIT License.
