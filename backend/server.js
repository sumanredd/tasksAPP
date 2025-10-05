import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = "my_super_secret_key_123!";

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));


const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error_msg: "No token found" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role; // role: USER or ADMIN
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error_msg: "Invalid or expired token" });
  }
};



// Register (only normal users)
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error_msg: "All fields are required" });

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser)
      return res.status(400).json({ error_msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: "USER" },
    });

    res.status(200).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Internal server error" });
  }
});

// Login (user/admin)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error_msg: "Username & password required" });

  try {
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) return res.status(400).json({ error_msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error_msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: "Login successful", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Internal server error" });
  }
});

// Get current user
app.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ error_msg: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Internal server error" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.status(200).json({ msg: "Logged out successfully" });
});

// -------------------- Task Routes --------------------

// Get all tasks (anyone can see all)
app.get("/tasks", authenticate, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Failed to fetch tasks" });
  }
});

// Create task
app.post("/tasks", authenticate, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error_msg: "Title required" });

  try {
    const task = await prisma.task.create({
      data: { title, userId: req.userId },
      include: { user: { select: { id: true, username: true } } },
    });
    res.status(200).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Failed to create task" });
  }
});

// Update task (owner or admin)
app.put("/tasks/:id", authenticate, async (req, res) => {
  const { title } = req.body;
  const taskId = parseInt(req.params.id);
  if (!title) return res.status(400).json({ error_msg: "Title required" });

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error_msg: "Task not found" });

    if (task.userId !== req.userId && req.userRole !== "ADMIN")
      return res.status(403).json({ error_msg: "Unauthorized" });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        editedByAdmin: req.userRole === "ADMIN" ? true : task.editedByAdmin,
      },
      include: { user: { select: { id: true, username: true } } },
    });

    res.status(200).json({ task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Failed to update task" });
  }
});

// Delete task (owner or admin)
app.delete("/tasks/:id", authenticate, async (req, res) => {
  const taskId = parseInt(req.params.id);
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error_msg: "Task not found" });

    if (task.userId !== req.userId && req.userRole !== "ADMIN")
      return res.status(403).json({ error_msg: "Unauthorized" });

    await prisma.task.delete({ where: { id: taskId } });
    res.status(200).json({ msg: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_msg: "Failed to delete task" });
  }
});

// -------------------- Start Server --------------------
app.listen(4000, () => console.log("🚀 Server running on port 4000"));
