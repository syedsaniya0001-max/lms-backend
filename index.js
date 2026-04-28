const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
const allowedOrigins = [
  "https://lms-frontend-five-beta.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- SCHEMAS ---
const Student = mongoose.model('Student', new mongoose.Schema({
    name: String, roll: String, branch: String, entry: String, img: String,
    password: { type: String, default: "" }
}));

const Faculty = mongoose.model('Faculty', new mongoose.Schema({
    name: String, fid: String, subject: String, dept: String, img: String,
    password: { type: String, default: "" }
}));

const Librarian = mongoose.model('Librarian', new mongoose.Schema({
    name: String, dept: String, img: String,
    password: { type: String, default: "" }
}));

const History = mongoose.model('History', new mongoose.Schema({
    type: String, book: String, student: String, date: String
}));

// SCHEMA CHANGE: Explicitly defined types for New Arrivals logic
const Book = mongoose.model('Book', new mongoose.Schema({
    name: String,
    author: String,
    code: String,
    cover: String,
    status: { type: String, default: "Available" },
    isNewArrival: { type: Boolean, default: false }, // FIXED: Ensure Boolean type
    addedDate: { type: String, default: "" },
    studentName: { type: String, default: "" },
    issueDate: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    fine: { type: Number, default: 0 }
}));

const Request = mongoose.model('Request', new mongoose.Schema({
    studentName: String, bookName: String, requestDate: String,
    status: { type: String, default: "Pending" }
}));

// --- ROUTES ---

// DIAGNOSTIC: Check a specific book's data in database
app.get('/api/books/:id/diagnose', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found" });
        res.json({
            _id: book._id,
            name: book.name,
            isNewArrival: book.isNewArrival,
            isNewArrivalType: typeof book.isNewArrival,
            addedDate: book.addedDate,
            status: book.status,
            rawBookObject: book
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// MIGRATION: Initialize isNewArrival field for existing books
app.get('/api/migrate-books', async (req, res) => {
    try {
        const result = await Book.updateMany(
            { isNewArrival: { $exists: false } },
            { $set: { isNewArrival: false, addedDate: "" } }
        );
        res.json({ success: true, message: `Updated ${result.modifiedCount} books` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    const { role, id, password } = req.body;
    if (role === 'admin' && id === 'admin' && password === 'admin@2008') {
        return res.json({ success: true, name: "Administrator" });
    }
    try {
        let user = null;
        if (role === 'student') user = await Student.findOne({ roll: id });
        else if (role === 'faculty') user = await Faculty.findOne({ fid: id });
        else if (role === 'librarian') user = await Librarian.findOne({ 
            name: { $regex: new RegExp(`^${id}$`, 'i') } 
        });
        if (!user) return res.status(401).json({ message: "ID not found." });
        const defaultPass = role === 'student' ? user.roll : (role === 'faculty' ? user.fid : user.name);
        const savedPass = user.password || defaultPass;
        if (password === savedPass) res.json({ success: true, name: user.name });
        else res.status(401).json({ message: "Incorrect Password!" });
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// 2. Set Password Route
app.put('/api/set-password', async (req, res) => {
    try {
        const { role, id, newPassword } = req.body;
        let Model = role === 'student' ? Student : role === 'faculty' ? Faculty : Librarian;
        const query = role === 'student' ? { roll: id } : role === 'faculty' ? { fid: id } : { name: id };
        await Model.findOneAndUpdate(query, { password: newPassword });
        res.json({ success: true, message: "Password set successfully!" });
    } catch (err) { res.status(500).json({ error: "Password update failed" }); }
});

// --- DYNAMIC ROUTE GENERATOR ---
const createApi = (path, Model) => {
    // GET all
    app.get(`/api/${path}`, async (req, res) => {
        try {
            const data = await Model.find();
            res.json(data);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // POST
    app.post(`/api/${path}`, async (req, res) => {
        try {
            const newRecord = await new Model(req.body).save();
            res.json(newRecord);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // PUT (The fixed update logic)
    app.put(`/api/${path}/:id`, async (req, res) => {
        try {
            const updated = await Model.findByIdAndUpdate(
                req.params.id, 
                { $set: req.body }, 
                { new: true, runValidators: false }
            );
            if (!updated) return res.status(404).json({ error: "Record not found" });
            res.json(updated);
        } catch (err) { res.status(500).json({ error: "Update failed" }); }
    });
    
    // DELETE
    app.delete(`/api/${path}/:id`, async (req, res) => {
        try {
            const deleted = await Model.findByIdAndDelete(req.params.id);
            res.json(deleted);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
};
// --- INITIALIZE API CALLS ---
createApi('students', Student);
createApi('faculties', Faculty);
createApi('librarians', Librarian);
createApi('books', Book);
createApi('history', History);
createApi('requests', Request);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));