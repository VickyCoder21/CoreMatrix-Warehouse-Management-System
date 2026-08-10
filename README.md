# 📦 CoreMatrix Warehouse Management System

A full-stack Warehouse Management System designed to manage
warehouse operations, inventory, purchasing, suppliers,
transporters, users, and screen-level authorization.

---

## 🚀 Overview

CoreMatrix Warehouse Management System is a full-stack web
application developed using React.js, ASP.NET Core Web API,
and Microsoft SQL Server.

The system provides centralized warehouse management with
secure JWT authentication, user screen authorization,
dashboard analytics, master management, purchase order
processing, GRN processing, and reporting.

## 🏢 Project

**CoreMatrix Technologies**

---

# ✨ Features

## 🔐 Authentication

- Secure Login
- JWT Authentication
- Protected APIs
- Session Management
- Logout

---

## 📊 Dashboard

- Employee Count
- Item Count
- Supplier Count
- Purchase Order Count
- Today's Summary
- Purchase Order Statistics
- Recent Purchase Orders

---

## 📁 Master Modules

- Employee Master
- User Master
- Supplier Master
- Item Master
- Transporter Master

---

## 📦 Transaction Modules

- Purchase Order Entry
- Purchase Order Report
- Goods Receipt (GRN)
- Label Printing

---

## 👥 User Management

- User Rights
- Screen Authorization
- Dynamic Sidebar Menu
- Role-Based Screen Access

---

## 🔒 Security

- JWT Authentication
- API Authorization
- Protected Controllers
- Token Validation
- Dynamic Screen Permissions

---

## 🎨 UI Features

- Responsive Design
- Dashboard Cards
- Professional Login Screen

---

## 📄 Reports

- Purchase Order Report
- Excel Export
- PDF Export
- Search
- Pagination
- Filters

---

## ✅ Validation

- Required Field Validation
- Duplicate Validation
- Excel Validation
- Success/Error Popup Messages

---

# 🛠 Technology Stack

## Frontend

- React.js
- CoreUI
- Axios
- React Router
- Bootstrap

---

## Backend

- ASP.NET Core Web API (.NET 8)
- C#
- ADO.NET
- REST API
- JWT Authentication

---

## Database

- Microsoft SQL Server
- Stored Procedures
- Views
- Transactions

---

# 🏗 Project Architecture

```
React Frontend
       │
       │ Axios API
       ▼
ASP.NET Core Web API
       │
       │ ADO.NET
       ▼
SQL Server Database
       │
       ▼
Stored Procedures
```

---

# 📂 Project Structure

```
CoreMatrix-Warehouse-Management-System

│
├── Frontend
│   ├── Components
│   ├── Services
│   ├── Layout
│   ├── Routes
│   ├── Assets
│   ├── Context
│   └── Utils
│
├── Backend
│   ├── Controllers
│   ├── Models
│   ├── Helpers
│   ├── Data
│   ├── Middleware
│   └── Program.cs
│
├── Database
│   ├── Tables
│   ├── Stored Procedures
│   ├── Views
│   └── Scripts
│
├── Screenshots
│
└── README.md
```

---

# 🔐 Authentication Flow

```
User Login
      │
      ▼
Login API
      │
      ▼
Verify Username & Password
      │
      ▼
Generate JWT Token
      │
      ▼
Store JWT Token
      │
      ▼
Access Protected APIs
```

---

# 👥 User Rights Flow

```
Administrator

      │

Assign Screen Rights

      │

USERAUTHENTICATION Table

      │

User Login

      │

Fetch User Rights

      │

Generate Sidebar

      │

Display Authorized Screens Only
```

---

# 📊 Dashboard

The dashboard displays real-time warehouse statistics including:

- Employees
- Items
- Suppliers
- Purchase Orders
- Dashboard Summary
- Purchase Order Statistics
- Recent Purchase Orders

---

# 🔒 Security Features

- JWT Authentication
- Protected Controllers
- Token Validation
- Dynamic User Rights
- Secure API Communication
- Role-Based Access Control

---

# 🗄 Database Tables

- EMPLOYEE
- USERMASTER
- SUPPLIER
- ITEMMASTER
- TRANSPORTER
- PURCHASEORDER
- PURCHASEORDERDETAILS
- USERAUTHENTICATION
- SCREENDETAILS

---

# 🌐 API Endpoints

## Login

```
POST

/api/Login/Login
```

---

## Dashboard

```
GET

/api/Dashboard/DashboardPageLoad
```

---

## Employee

```
GET
POST
PUT
DELETE
```

---

## Supplier

```
GET
POST
PUT
DELETE
```

---

## Item

```
GET
POST
PUT
DELETE
```

---

## Purchase Order

- Create Purchase Order
- Purchase Order Report
- Export Excel
- Export PDF

---

# 📸 Application Screenshots

> Add screenshots inside the **Screenshots** folder.

Example:

```
Screenshots

Login.png

Dashboard.png

EmployeeMaster.png

SupplierMaster.png

ItemMaster.png

TransporterMaster.png

PurchaseOrder.png

PurchaseOrderReport.png

UserRights.png

DarkTheme.png
```

After adding screenshots, display them like this:

```md
## Login

![Login](Screenshots/Login.png)

## Dashboard

![Dashboard](Screenshots/Dashboard.png)

## Employee Master

![Employee](Screenshots/EmployeeMaster.png)

## User Rights

![User Rights](Screenshots/UserRights.png)
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/VickyCoder21/CoreMatrix-Warehouse-Management-System.git
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

---

## Backend

```bash
Open the ASP.NET Core Solution

Run the API
```

---

## Database

- Restore SQL Server Database
- Execute Tables
- Execute Stored Procedures
- Update Connection String
- Run Application

---

# 🚀 Future Enhancements

- Barcode Scanner
- QR Code Tracking
- Email Notifications
- Notification Center
- Warehouse Analytics
- Audit Logs
- Stock Alerts
- Mobile Responsive App
- Multi-Warehouse Support
- Azure Cloud Deployment
- Docker Deployment

---

# 👨‍💻 Author

**Vignesh P**

.NET Full Stack Developer

Chennai, Tamil Nadu, India

---

# 📜 License

This project was developed for **learning, portfolio, interview demonstration, and freelance purposes**.

© 2026 CoreMatrix Technologies. All Rights Reserved.
