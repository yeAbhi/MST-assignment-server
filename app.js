const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
// app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
// mongoose
//   .connect("mongodb://localhost:27017/profileDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("Error connecting to MongoDB:", err));

const connectDb = async () => {
  console.log('db called')
  await mongoose
    // .connect('mongodb://0.0.0.0:27017/profileDB')   
    .connect('mongodb+srv://assgn-usr:vdatjMj7kL26O0yi@assgn.fjbrn.mongodb.net/mstAssignment')
    .then(() => console.log("Database connected!"))
    .catch(err => console.log(err));

}
connectDb()

// Mongoose Schema
const profileSchema = new mongoose.Schema({
  businessName: String,
  phoneNumber: String,
  gstin: String,
  email: String,
  businessType: String,
  businessCategory: String,
  state: String,
  pincode: String,
  businessAddress: String,
  profileImage: String,
});

const Profile = mongoose.model("Profile", profileSchema);

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get('/',(req,res)=>{
  res.json("Hello world")
})

// API Endpoint to Save Profile Data
app.post("/api/saveProfile", upload.single("profileImage"), async (req, res) => {
  console.log("api working")
  try {
    const {
      businessName,
      phoneNumber,
      gstin,
      email,
      businessType,
      businessCategory,
      state,
      pincode,
      businessAddress,
    } = req.body;

    const profile = new Profile({
      businessName,
      phoneNumber,
      gstin,
      email,
      businessType,
      businessCategory,
      state,
      pincode,
      businessAddress,
      profileImage: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedProfile = await profile.save();
    res.status(201).json({ message: "Profile saved successfully", savedProfile });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Error saving profile", error });
  }
});

app.get("/api/getProfile", async (req, res) => {
  try {
    const id = '6790b9623c4ba06fc5a769f3';

    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/updateProfile/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.params.id;

    // Destructure form data from the request body
    const {
      businessName,
      phoneNumber,
      gstin,
      email,
      businessType,
      businessCategory,
      state,
      pincode,
      businessAddress,
    } = req.body;

    // Create an update object
    const updateData = {
      businessName,
      phoneNumber,
      gstin,
      email,
      businessType,
      businessCategory,
      state,
      pincode,
      businessAddress,
    };

    // If a new profile image was uploaded, include it in the update
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    // Update the user's profile in the database
    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
});


// Start Server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
