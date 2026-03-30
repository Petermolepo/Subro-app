require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  }
});
const upload = multer({ storage });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
const runQuery = (sql, params) => db.promise().execute(sql, params);
const runBulkQuery = (sql, params) => db.promise().query(sql, params);

const JWT_SECRET = process.env.JWT_SECRET || "super_secret";
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}
function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/auth/register", async (req, res) => {
  if (process.env.ALLOW_REGISTRATION !== "true") return res.status(403).json({ error: "Registration disabled" });
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await runQuery("INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)", [name, email, hashed, role || "subro_agent"]);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await runQuery("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/claims", authRequired, upload.array("documents"), async (req, res) => {
  try {
    const { policy_number, claimant_name, insurer_a, insurer_b, accident_date, description, amount_paid } = req.body;
    const claimNumber = "CLM" + Date.now();
    const [result] = await runQuery(
      `INSERT INTO claims (claim_number, policy_number, claimant_name, insurer_a, insurer_b, accident_date, description, amount_paid, created_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [claimNumber, policy_number, claimant_name, insurer_a, insurer_b, accident_date || null, description, amount_paid || 0, req.user.id]
    );
    const claimId = result.insertId;

    if (req.files && req.files.length) {
      const values = req.files.map((f) => [claimId, f.filename, f.originalname, req.user.id]);
      await runBulkQuery("INSERT INTO claim_documents (claim_id, filename, original_name, uploaded_by) VALUES ?", [values]);
    }

    res.json({ ok: true, claimId, claimNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create claim" });
  }
});

app.get("/api/claims", authRequired, async (req, res) => {
  try {
    const [rows] = await runQuery("SELECT * FROM claims ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
});

app.get("/api/claims/:id", authRequired, async (req, res) => {
  try {
    const [claims] = await runQuery("SELECT * FROM claims WHERE id = ?", [req.params.id]);
    const claim = claims[0];
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    const [docs] = await runQuery("SELECT * FROM claim_documents WHERE claim_id = ?", [req.params.id]);
    const [responses] = await runQuery("SELECT * FROM claim_responses WHERE claim_id = ?", [req.params.id]);
    res.json({ claim, documents: docs, responses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch claim" });
  }
});

app.post("/api/claims/:id/respond", authRequired, async (req, res) => {
  try {
    const { response_type, message, amount_offered } = req.body;
    await runQuery(
      `INSERT INTO claim_responses (claim_id, responder_name, responder_role, message, response_type, amount_offered)
       VALUES (?,?,?,?,?,?)`,
      [req.params.id, req.user.name, req.user.role, message, response_type, amount_offered || null]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to respond" });
  }
});

app.post("/api/complaints", authRequired, upload.fields([{ name: "policy_document", maxCount: 1 }, { name: "evidence", maxCount: 5 }]), async (req, res) => {
  try {
    const { type, policyholder_name, policy_inception_date, incident_date, rejection_reason, details } = req.body;
    if (!type || !policyholder_name) return res.status(400).json({ error: "Missing required fields" });

    let policyDoc = null;
    let evidenceFiles = [];
    if (req.files) {
      if (req.files.policy_document) policyDoc = req.files.policy_document[0].filename;
      if (req.files.evidence) evidenceFiles = req.files.evidence.map((f) => f.filename);
    }

    const [result] = await runQuery(
      `INSERT INTO complaints (type, policyholder_name, policy_inception_date, incident_date, rejection_reason, policy_document, evidence_files, details, created_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [type, policyholder_name, policy_inception_date || null, incident_date || null, rejection_reason || null, policyDoc, evidenceFiles.join(","), details || null, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

app.get("/api/complaints", authRequired, async (req, res) => {
  try {
    let query = "SELECT * FROM complaints";
    const params = [];
    if (req.user.role !== "admin") {
      query += " WHERE created_by = ?";
      params.push(req.user.id);
    }
    query += " ORDER BY created_at DESC";
    const [rows] = await runQuery(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

app.get("/api/complaints/:id", authRequired, async (req, res) => {
  try {
    const [rows] = await runQuery("SELECT * FROM complaints WHERE id = ?", [req.params.id]);
    const complaint = rows[0];
    if (!complaint) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "admin" && complaint.created_by !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch complaint" });
  }
});

app.put("/api/complaints/:id", authRequired, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  try {
    const { status } = req.body;
    await runQuery("UPDATE complaints SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update" });
  }
});

app.use("/uploads", express.static(UPLOAD_DIR));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
