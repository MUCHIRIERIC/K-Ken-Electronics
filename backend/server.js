// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

// ==========================================
// 1. CONFIG & MIDDLEWARE
// ==========================================
// Security Headers
app.use(helmet({ crossOriginResourcePolicy: false })); // Allowed false so frontend can load images
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Expose the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// JWT Authentication Middleware
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};

// Multer File Upload Configuration
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp|gif/;
    if (fileTypes.test(path.extname(file.originalname).toLowerCase()) && fileTypes.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// ==========================================
// 2. DATABASE CONNECTION & SEEDING
// ==========================================
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) console.warn('⚠️ WARNING: MONGO_URI is not set in your .env file!');

// ADDED: { family: 4 } to force IPv4 and bypass Node.js IPv6 DNS SRV resolution bugs
mongoose.connect(MONGO_URI, {
  family: 4, 
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    seedAdminUser(); // Create default admin if none exists
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error Details:', err.message);
    if (err.message.includes('querySrv')) {
      console.error('\n💡 NETWORK FIX REQUIRED: Your internet provider is blocking MongoDB Atlas SRV records.');
      console.error('To fix this, change your MONGO_URI in the .env file to use the STANDARD connection string (without +srv).');
    }
  });

// ==========================================
// 3. MODELS
// ==========================================
const Admin = mongoose.model('Admin', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // e.g., "Modern TVs", "Mobile Phones", "Subwoofers"
});
const Category = mongoose.model('Category', CategorySchema);

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  imageUrl: { type: String, required: true }
}, { timestamps: true });
const Product = mongoose.model('Product', ProductSchema);

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  replied: { type: Boolean, default: false },
  replyMessage: { type: String },
  submittedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

// Admin Seeder Logic
async function seedAdminUser() {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await Admin.create({ email: defaultEmail, password: hashedPassword });
    console.log(`✅ Default admin created (${defaultEmail}). Please change the password via the dashboard.`);
  }
}

// ==========================================
// 4. CONTROLLERS
// ==========================================
const AuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });
      res.json({ message: 'Login successful', token });
    } catch (error) {
      res.status(500).json({ error: 'Server error during login' });
    }
  }
};

const ProductController = {
  getAllPublic: async (req, res) => {
    try {
      const products = await Product.find().populate('categoryId', 'name');
      
      // Inject logic for low stock and items left
      const formattedProducts = products.map(product => ({
        _id: product._id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.categoryId ? product.categoryId.name : 'Uncategorized',
        imageUrl: product.imageUrl,
        itemsLeftInStock: product.stockQuantity,
        isLowStock: product.stockQuantity < 3 // Dynamic flag for the frontend
      }));

      res.json(formattedProducts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  },
  create: async (req, res) => {
    try {
      const { title, description, price, stockQuantity, categoryId } = req.body;
      if (!req.file) return res.status(400).json({ error: 'Product image is required' });

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      const product = new Product({
        title, description, price, stockQuantity, categoryId, imageUrl
      });

      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: 'Error creating product', details: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: 'Error deleting product' });
    }
  }
};

const CategoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) { res.status(500).json({ error: 'Error fetching categories' }); }
  },
  create: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required' });
      
      const category = new Category({ name });
      await category.save();
      res.status(201).json(category);
    } catch (error) { res.status(400).json({ error: 'Error creating category (may already exist)' }); }
  },
  delete: async (req, res) => {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.json({ message: 'Category deleted' });
    } catch (error) { res.status(400).json({ error: 'Error deleting category' }); }
  }
};

const ContactController = {
  submit: async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required' });

      const newContact = new Contact({ name, email, message });
      await newContact.save();
      res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) { res.status(400).json({ error: 'Error submitting message' }); }
  },
  getAll: async (req, res) => {
    try {
      const messages = await Contact.find().sort({ submittedAt: -1 });
      res.json(messages);
    } catch (error) { res.status(400).json({ error: 'Error fetching messages' }); }
  },
  delete: async (req, res) => {
    try {
      await Contact.findByIdAndDelete(req.params.id);
      res.json({ message: 'Message deleted' });
    } catch (error) { res.status(400).json({ error: 'Error deleting message' }); }
  },
  reply: async (req, res) => {
    try {
      const { replyMessage } = req.body;
      if (!replyMessage) return res.status(400).json({ error: 'Reply message is required' });

      const contact = await Contact.findByIdAndUpdate(
        req.params.id, 
        { replied: true, replyMessage }, 
        { new: true }
      );
      
      // NOTE: To actually send an email to the user, you would integrate 'nodemailer' here
      // transporter.sendMail({ to: contact.email, subject: 'Reply from Store', text: replyMessage });

      res.json({ message: 'Reply logged successfully', contact });
    } catch (error) { res.status(400).json({ error: 'Error replying to message' }); }
  }
};

// ==========================================
// 5. ROUTES
// ==========================================
// Add this root endpoint to serve a status message for GET /
app.get('/', (req, res) => {
  res.send('🚀 K Ken Electronics API is up and running!');
});

// --- Public Routes ---
app.post('/api/admin/login', AuthController.login);
app.get('/api/products', ProductController.getAllPublic);
app.get('/api/categories', CategoryController.getAll);
app.post('/api/contact', ContactController.submit);

// --- Protected Admin Routes ---
app.use('/api/admin', verifyJWT); // Applies JWT middleware to all routes below this line

// Products
app.post('/api/admin/products', upload.single('image'), ProductController.create);
app.delete('/api/admin/products/:id', ProductController.delete);

// Categories (Add Types: TVs, Phones, Subwoofers)
app.post('/api/admin/categories', CategoryController.create);
app.delete('/api/admin/categories/:id', CategoryController.delete);

// Contacts (Read, Reply, Delete)
app.get('/api/admin/contacts', ContactController.getAll);
app.post('/api/admin/contacts/:id/reply', ContactController.reply);
app.delete('/api/admin/contacts/:id', ContactController.delete);

// ==========================================
// 6. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Secure Server running on port ${PORT}`);
});
