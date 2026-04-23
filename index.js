const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB Connected'));

// --- SCHEMAS ---
const Student = mongoose.model('Student', new mongoose.Schema({
    name: String, roll: String, branch: String, entry: String, img: String
}));

const Faculty = mongoose.model('Faculty', new mongoose.Schema({
    name: String, fid: String, subject: String, dept: String, img: String
}));

const Librarian = mongoose.model('Librarian', new mongoose.Schema({
    name: String, dept: String, img: String
}));

const History = mongoose.model('History', new mongoose.Schema({
    type: String, 
    book: String,
    student: String,
    date: String
}));

const Book = mongoose.model('Book', new mongoose.Schema({
    name: String,
    author: String,
    code: String,
    cover: String,
    status: { type: String, default: "Available" },
    studentName: { type: String, default: "" },
    issueDate: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    fine: { type: Number, default: 0 }
}));

// --- NEW SCHEMA FOR STUDENT REQUESTS ---
const Request = mongoose.model('Request', new mongoose.Schema({
    studentName: String,
    bookName: String,
    requestDate: String,
    status: { type: String, default: "Pending" }
}));

// --- DYNAMIC ROUTE GENERATOR ---
const createApi = (path, Model) => {
    app.get(`/api/${path}`, async (req, res) => res.json(await Model.find()));
    app.post(`/api/${path}`, async (req, res) => res.json(await new Model(req.body).save()));
    app.put(`/api/${path}/:id`, async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, req.body)));
    app.delete(`/api/${path}/:id`, async (req, res) => res.json(await Model.findByIdAndDelete(req.params.id)));
};

// --- API CALLS ---
createApi('students', Student);
createApi('faculties', Faculty);
createApi('librarians', Librarian);
createApi('books', Book);
createApi('history', History);
createApi('requests', Request); // This creates http://localhost:5000/api/requests

// app.listen(5000, () => console.log('🚀 Server running on port 5000'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));