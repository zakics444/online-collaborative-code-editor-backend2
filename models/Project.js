const mongoose = require('mongoose');

// Define the Project schema
const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        unique: true, // Ensure project name is unique
    },
    pjpassword: { // Changed field name from 'password' to 'pjpassword'
        type: String,
        required: [true, 'Project password is required'],
        minlength: [6, 'Project password must be at least 6 characters long'], // Validate password length
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User collection
        required: true, // Every project must have an owner
    },
    code: {
        type: String,
        default: "", // Default empty code if none is provided
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically store the creation timestamp
    },
});

// Create and export the Project model
const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
