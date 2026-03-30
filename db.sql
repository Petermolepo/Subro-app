CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('subro_agent','adjuster','insurer','admin') DEFAULT 'subro_agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
