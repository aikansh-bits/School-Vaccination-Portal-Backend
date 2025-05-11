# 🏥 School Vaccination Portal – Backend

This is the **backend server** for the School Vaccination Portal built with **Node.js**, **Express**, and **MongoDB**. It provides RESTful APIs for managing students, vaccination drives, generating reports, and handling CSV uploads.

---

## 📦 Tech Stack

| Tool         | Description                          |
|--------------|--------------------------------------|
| Node.js      | JavaScript runtime environment       |
| Express.js   | Web server framework                 |
| MongoDB      | NoSQL database (Atlas used)          |
| Mongoose     | ODM for MongoDB                      |
| Multer       | Middleware for handling file uploads |
| CSV-Parser   | To read and process CSV files        |
| dotenv       | For managing environment variables   |
| CORS         | Cross-Origin Resource Sharing        |

---

## 🚀 Features

- 📌 Add / Edit individual student records
- 📌 Mark students as vaccinated (per drive)
- 📌 Create & view vaccination drives
- 📌 Bulk upload student data using CSV
- 📌 Generate filtered student vaccination reports
- 📌 Environment-safe config via `.env`

---

## ⚙️ Setup Instructions

### 1. Clone the repository

- git clone https://github.com/your-username/School-Vaccination-Portal-Backend.git
- cd School-Vaccination-Portal-Backend

### 2. Install dependencies

- npm install

### 3. Configure environment variables

- MONGO_URI=""

### 4. Run the server

- npm run dev (With auto-reload)


