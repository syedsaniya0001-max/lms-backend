// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // --- MIDDLEWARE ---
// app.use(cors());
// app.use(express.json({ limit: '50mb' }));

// // --- DATABASE CONNECTION ---
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('✅ MongoDB Connected'))
//     .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // --- SCHEMAS ---
// const Student = mongoose.model('Student', new mongoose.Schema({
//     name: String, roll: String, branch: String, entry: String, img: String,
//     password: { type: String, default: "" }
// }));

// const Faculty = mongoose.model('Faculty', new mongoose.Schema({
//     name: String, fid: String, subject: String, dept: String, img: String,
//     password: { type: String, default: "" }
// }));

// const Librarian = mongoose.model('Librarian', new mongoose.Schema({
//     name: String, dept: String, img: String,
//     password: { type: String, default: "" }
// }));

// const History = mongoose.model('History', new mongoose.Schema({
//     type: String, book: String, student: String, date: String
// }));

// const Book = mongoose.model('Book', new mongoose.Schema({
//     name: String,
//     author: String,
//     code: String,
//     cover: String,
//     status: { type: String, default: "Available" },
//     isNewArrival: { type: Boolean, default: false },
//     addedDate: { type: String, default: "" },
//     studentName: { type: String, default: "" },
//     issueDate: { type: String, default: "" },
//     dueDate: { type: String, default: "" },
//     fine: { type: Number, default: 0 }
// }));

// const Request = mongoose.model('Request', new mongoose.Schema({
//     studentName: String, bookName: String, requestDate: String,
//     status: { type: String, default: "Pending" }
// }));

// // --- ROUTES ---

// // MIGRATION: Initialize isNewArrival field for existing books
// app.get('/api/migrate-books', async (req, res) => {
//     try {
//         const result = await Book.updateMany(
//             { isNewArrival: { $exists: false } },
//             { $set: { isNewArrival: false, addedDate: "" } }
//         );
//         res.json({ success: true, message: `Updated ${result.modifiedCount} books` });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 1. Login Route
// // ... inside the PUT route ...
// app.put(`/api/${path}/:id`, async (req, res) => {
//     try {
//         // CHANGE: Added { $set: req.body }.
//         // This tells MongoDB to ONLY update the specific fields we sent (like isNewArrival)
//         // instead of replacing the whole book document, which can cause data loss.
//         const updated = await Model.findByIdAndUpdate(
//             req.params.id, 
//             { $set: req.body }, 
//             { new: true } 
//         );
//         res.json(updated);
//     } catch (err) {
//         res.status(500).json({ error: "Update failed" });
//     }
// });

// // 2. Set Password Route
// app.put('/api/set-password', async (req, res) => {
//     try {
//         const { role, id, newPassword } = req.body;
//         let Model = role === 'student' ? Student : role === 'faculty' ? Faculty : Librarian;
//         const query = role === 'student' ? { roll: id } : role === 'faculty' ? { fid: id } : { name: id };
        
//         await Model.findOneAndUpdate(query, { password: newPassword });
//         res.json({ success: true, message: "Password set successfully!" });
//     } catch (err) {
//         res.status(500).json({ error: "Password update failed" });
//     }
// });

// // --- DYNAMIC ROUTE GENERATOR ---
// const createApi = (path, Model) => {
//     app.get(`/api/${path}`, async (req, res) => res.json(await Model.find()));
    
//     app.post(`/api/${path}`, async (req, res) => res.json(await new Model(req.body).save()));
    
//     // This is the ONE unified PUT route for books and others
//     app.put(`/api/${path}/:id`, async (req, res) => {
//         try {
//             const updated = await Model.findByIdAndUpdate(
//                 req.params.id, 
//                 { $set: req.body }, 
//                 { new: true, runValidators: true } 
//             );
//             res.json(updated);
//         } catch (err) {
//             res.status(500).json({ error: "Update failed" });
//         }
//     });
    
//     app.delete(`/api/${path}/:id`, async (req, res) => res.json(await Model.findByIdAndDelete(req.params.id)));
// };

// // --- INITIALIZE API CALLS ---
// createApi('students', Student);
// createApi('faculties', Faculty);
// createApi('librarians', Librarian);
// createApi('books', Book);
// createApi('history', History);
// createApi('requests', Request);

// // --- START SERVER ---
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---


app.use(cors({
  origin: "https://lms-frontend-five-beta.vercel.app", 
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
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        
        res.json({
            _id: book._id,
            name: book.name,
            isNewArrival: book.isNewArrival,
            isNewArrivalType: typeof book.isNewArrival,
            addedDate: book.addedDate,
            status: book.status,
            rawBookObject: book  // Send entire object for inspection
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MIGRATION: Initialize isNewArrival field for existing books
app.get('/api/migrate-books', async (req, res) => {
    try {
        const result = await Book.updateMany(
            { isNewArrival: { $exists: false } },
            { $set: { isNewArrival: false, addedDate: "" } }
        );
        res.json({ success: true, message: `Updated ${result.modifiedCount} books` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 1. Login Route
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
    } catch (err) {
        res.status(500).json({ error: "Password update failed" });
    }
});

// --- DYNAMIC ROUTE GENERATOR ---
const createApi = (path, Model) => {
    // GET all records
    app.get(`/api/${path}`, async (req, res) => {
        try {
            const data = await Model.find();
            console.log(`✅ GET /api/${path}: Found ${data.length} records`);
            res.json(data);
        } catch (err) {
            console.error(`❌ GET /api/${path} Error:`, err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // POST (CREATE) record
    app.post(`/api/${path}`, async (req, res) => {
        try {
            console.log(`📝 POST /api/${path}: Creating with data:`, req.body);
            const newRecord = await new Model(req.body).save();
            console.log(`✅ POST /api/${path}: Created successfully`);
            res.json(newRecord);
        } catch (err) {
            console.error(`❌ POST /api/${path} Error:`, err.message);
            res.status(500).json({ error: err.message });
        }
    });
    
    // PUT (UPDATE) record - WITH SPECIAL HANDLING FOR BOOKS
    // app.put(`/api/${path}/:id`, async (req, res) => {
    //     try {
    //         console.log(`📝 PUT /api/${path}/${req.params.id}: Updating with:`, req.body);
            
    //         const updated = await Model.findByIdAndUpdate(
    //             req.params.id, 
    //             { $set: req.body }, 
    //             { new: true, runValidators: false }
    //         );
            
    //         if (!updated) {
    //             console.error(`❌ PUT /api/${path}/${req.params.id}: Record not found`);
    //             return res.status(404).json({ error: "Record not found" });
    //         }

    //         // FOR BOOKS: Log the isNewArrival field specifically
    //         if (path === 'books') {
    //             console.log(`✅ PUT /api/books/${req.params.id}: Updated! isNewArrival is now: ${updated.isNewArrival} (type: ${typeof updated.isNewArrival}), addedDate: ${updated.addedDate}`);
    //         } else {
    //             console.log(`✅ PUT /api/${path}/${req.params.id}: Updated successfully`);
    //         }
            
    //         res.json(updated);
    //     } catch (err) {
    //         console.error(`❌ PUT /api/${path}/${req.params.id} Error:`, err.message);
    //         res.status(500).json({ error: err.message });
    //     }
    // });

 app.put(`/api/${path}/:id`, async (req, res) => {
    try {
        console.log(`📝 Updating ${path} ID: ${req.params.id}`, req.body);
        
        const updated = await Model.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: false } // Added runValidators: false
        );
        
        if (!updated) {
            return res.status(404).json({ error: "Record not found" });
        }
        
        console.log("✅ Database successfully updated. Current isNewArrival:", updated.isNewArrival);
        res.json(updated);
    } catch (err) {
        console.error("❌ Update Error:", err.message);
        res.status(500).json({ error: "Update failed" });
    }
});
    
    // DELETE record
    app.delete(`/api/${path}/:id`, async (req, res) => {
        try {
            console.log(`🗑️ DELETE /api/${path}/${req.params.id}: Deleting...`);
            const deleted = await Model.findByIdAndDelete(req.params.id);
            console.log(`✅ DELETE /api/${path}/${req.params.id}: Deleted successfully`);
            res.json(deleted);
        } catch (err) {
            console.error(`❌ DELETE /api/${path}/${req.params.id} Error:`, err.message);
            res.status(500).json({ error: err.message });
        }
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