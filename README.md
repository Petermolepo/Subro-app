🏢 Subro Insurance – Subrogation & Complaint Management System
https://img.shields.io/badge/Node.js-18.x-green https://img.shields.io/badge/MySQL-8.0-blue https://img.shields.io/badge/Express-4.18-lightgrey https://img.shields.io/badge/License-MIT-yellow

A complete internal portal for insurance professionals to automate subrogation workflows and handle policyholder complaints (waiting periods, retrenchment, lapsed policies, non‑payment of premiums). Built with Node.js, Express, MySQL and a responsive Bootstrap 5 frontend.

✨ Features
🔁 Subrogation Module
Claim management – create, view, and track claims with unique numbers

Evidence upload – attach multiple documents (PDF, images) to claims

Negotiation workflow – record responses (accept/deny/negotiate) with amounts

Dashboard – search, filter, export CSV, and paginate claims

Role‑based access – subrogation agents, adjusters, insurers

📝 Complaint Handling Module
Pre‑built complaint types:

Waiting period disputes

Retrenchment claim denials

Lapsed policy / reinstatement

Non‑payment of premiums

File uploads – attach policy documents and supporting evidence

Status tracking – pending, under review, resolved

Complaint guide page – explains common reasons for claim rejections (based on Ombud guidelines)

🔒 Security
JWT authentication

Bcrypt password hashing

Protected API endpoints

🛠️ Tech Stack
Layer	Technology
Backend	Node.js + Express
Database	MySQL (with mysql2 driver)
Authentication	JWT + bcrypt
File upload	Multer
Frontend	HTML5, Bootstrap 5, Vanilla JS
Styling	Custom CSS, Font Awesome icons
📋 Prerequisites
Node.js (v18 or later)

MySQL (v8.0 recommended) and MySQL Workbench (for easy setup)

Git (optional, for cloning)

🚀 Installation & Setup
1. Clone the repository
bash
git clone https://github.com/yourusername/subro-app.git
cd subro-app
2. Install dependencies
bash
npm install
3. Create the database
Open MySQL Workbench and execute the following SQL script:

sql
-- Create database
CREATE DATABASE IF NOT EXISTS subro_db;
USE subro_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('subro_agent','adjuster','insurer','admin') DEFAULT 'subro_agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_number VARCHAR(50) UNIQUE NOT NULL,
  policy_number VARCHAR(100),
  claimant_name VARCHAR(100),
  insurer_a VARCHAR(100),
  insurer_b VARCHAR(100),
  accident_date DATE,
  description TEXT,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status ENUM('initiated','negotiation','resolved','denied') DEFAULT 'initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Claim documents
CREATE TABLE IF NOT EXISTS claim_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Claim responses
CREATE TABLE IF NOT EXISTS claim_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_id INT NOT NULL,
  responder_name VARCHAR(100),
  responder_role VARCHAR(50),
  message TEXT,
  response_type ENUM('accept','deny','negotiate','other') DEFAULT 'other',
  amount_offered DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('waiting_period','retrenchment','lapsed_policy','non_payment') NOT NULL,
  policyholder_name VARCHAR(255) NOT NULL,
  policy_inception_date DATE,
  incident_date DATE,
  rejection_reason TEXT,
  policy_document VARCHAR(255),
  evidence_files TEXT,
  details TEXT,
  status ENUM('pending','under_review','resolved') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
4. Configure environment variables
Create a .env file in the project root:

env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=subro_db
JWT_SECRET=your_super_secret_key
ALLOW_REGISTRATION=true
PORT=3000
Replace your_mysql_password and your_super_secret_key with your actual values.

5. Start the server
bash
npm start
For development with auto‑restart:

bash
npm run dev
The app will be available at http://localhost:3000.

📁 Project Structure
text
subro-app/
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── uploads/                  # User‑uploaded files (auto‑created)
├── public/                   # Static frontend files
│   ├── index.html
│   ├── about.html
│   ├── register.html
│   ├── dashboard.html
│   ├── new_claim.html
│   ├── claim_view.html
│   ├── complaints-guide.html
│   ├── complaints.html
│   ├── auth.js
│   ├── dashboard.js
│   ├── new_claim.js
│   ├── claim_view.js
│   ├── register.js
│   └── styles.css
└── README.md
🖼️ Screenshots
Homepage
https://via.placeholder.com/800x400?text=Homepage+Screenshot

Dashboard (Claims)
https://via.placeholder.com/800x400?text=Dashboard+Screenshot

Complaint Form
https://via.placeholder.com/800x400?text=Complaint+Form+Screenshot

Claim Details & Negotiation
https://via.placeholder.com/800x400?text=Claim+View+Screenshot

🔌 API Endpoints
Method	Endpoint	Description	Auth Required
POST	/api/auth/register	Register a new user	No
POST	/api/auth/login	Login and get JWT	No
POST	/api/claims	Create a new claim	Yes
GET	/api/claims	List all claims	Yes
GET	/api/claims/:id	Get single claim + docs/responses	Yes
POST	/api/claims/:id/respond	Add a response (negotiation)	Yes
POST	/api/complaints	Submit a complaint	Yes
GET	/api/complaints	List user’s complaints	Yes
GET	/api/complaints/:id	Get single complaint	Yes (owner/admin)
PUT	/api/complaints/:id	Update complaint status (admin)	Admin only
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

📧 Contact
For questions or support, please contact: info@subroinsurance.com

Built with ❤️ for insurance professionals.

