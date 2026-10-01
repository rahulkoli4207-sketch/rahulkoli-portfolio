const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-this-password";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "public", "uploads");
const DB_FILE = path.join(DATA_DIR, "projects.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function readProjects() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function writeProjects(items) {
  fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2), "utf8");
}
if (!fs.existsSync(DB_FILE)) writeProjects([]);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));
app.use(express.static(path.join(ROOT, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "project";
    cb(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}-${safeBase}${ext}`);
  }
});

const upload = multer({
  storage,
  // No project-count limit and no artificial per-file byte limit.
  // Real capacity still depends on the server/storage provider.
  fileFilter: (req, file, cb) => {
    const workAllowed = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/quicktime"
    ];
    const thumbnailAllowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (file.fieldname === "thumbnail") return cb(null, thumbnailAllowed.includes(file.mimetype));
    if (file.fieldname === "file") return cb(null, workAllowed.includes(file.mimetype));
    cb(null, false);
  }
});

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: "Admin login required." });
}

app.post("/api/login", (req, res) => {
  if (String(req.body.password || "") !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password." });
  }
  req.session.admin = true;
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  res.json({ admin: !!(req.session && req.session.admin) });
});

app.get("/api/projects", (req, res) => {
  res.json(readProjects());
});

app.post("/api/projects", requireAdmin, upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "file", maxCount: 1 }
]), (req, res) => {
  const thumbnailFile = req.files && req.files.thumbnail && req.files.thumbnail[0];
  const workFile = req.files && req.files.file && req.files.file[0];
  const category = String(req.body.category || "");
  const valid = ["3d", "video", "graphic", "aiugc", "logo", "art", "uiux"];
  const needsThumbnail = ["video", "aiugc"].includes(category);

  if (!valid.includes(category)) {
    if (thumbnailFile) try { fs.unlinkSync(thumbnailFile.path); } catch {}
    if (workFile) try { fs.unlinkSync(workFile.path); } catch {}
    return res.status(400).json({ error: "Invalid category." });
  }
  if (!workFile) {
    if (thumbnailFile) try { fs.unlinkSync(thumbnailFile.path); } catch {}
    return res.status(400).json({ error: "Please select the work file." });
  }
  if (needsThumbnail && !thumbnailFile) {
    try { fs.unlinkSync(workFile.path); } catch {}
    return res.status(400).json({ error: "Please select a thumbnail image for Video Editing or AI UGC Ads." });
  }

  const project = {
    id: crypto.randomUUID(),
    category,
    title: String(req.body.title || "Untitled Project").trim().slice(0, 120),
    description: String(req.body.description || "").trim().slice(0, 500),
    thumbnail: thumbnailFile ? `/uploads/${thumbnailFile.filename}` : "",
    file: `/uploads/${workFile.filename}`,
    type: workFile.mimetype.startsWith("video/") ? "video" : "image",
    createdAt: new Date().toISOString()
  };

  const items = readProjects();
  items.unshift(project);
  writeProjects(items);
  res.json(project);
});

app.delete("/api/projects/:id", requireAdmin, (req, res) => {
  const items = readProjects();
  const project = items.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found." });

  const filePath = path.join(ROOT, "public", project.file.replace(/^\//, ""));
  const thumbnailPath = project.thumbnail ? path.join(ROOT, "public", project.thumbnail.replace(/^\//, "")) : null;
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
  try { if (thumbnailPath && fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath); } catch {}
  writeProjects(items.filter(p => p.id !== project.id));
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Rahul Portfolio running at http://localhost:${PORT}`);
  if (ADMIN_PASSWORD === "change-this-password") {
    console.log("IMPORTANT: Set ADMIN_PASSWORD before publishing online.");
  }
});
