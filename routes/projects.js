const express = require('express');
const bcrypt = require('bcryptjs');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create Project (Protected Route)
router.post('/create', authMiddleware, async (req, res) => {
    const { projectName, pjpassword } = req.body;

    try {
        if (!projectName || !pjpassword) {
            return res.status(400).json({ error: 'Project name and password are required' });
        }

        // Check if project name already exists
        const existingProject = await Project.findOne({ name: projectName });
        if (existingProject) {
            return res.status(409).json({ error: 'Project name already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(pjpassword, 10);

        // Create a new project with an initial code
        const newProject = new Project({
            name: projectName,
            pjpassword: hashedPassword,
            owner: req.user.userId,  // Link project to the authenticated user
            code: 'console.log("Initial code for project");'  // Set initial code for the project
        });

        // Save the new project
        await newProject.save();
        res.status(201).json({ message: 'Project created successfully', code: newProject.code });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Join Project (Protected Route)
router.post('/join', authMiddleware, async (req, res) => {
    const { projectName, pjpassword } = req.body;

    try {
        if (!projectName || !pjpassword) {
            return res.status(400).json({ error: 'Project name and password are required' });
        }

        // Find the project by name
        const project = await Project.findOne({ name: projectName });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify the password
        const isPasswordMatch = await bcrypt.compare(pjpassword, project.pjpassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid project credentials' });
        }

        // Successfully joined the project, return the project code
        res.status(200).json({ message: 'Joined project successfully', code: project.code });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to join project' });
    }
});

// Save Code (POST request to save code to a project)
router.post('/saveCode', authMiddleware, async (req, res) => {
    const { projectName, code } = req.body;

    try {
        if (!projectName || !code) {
            return res.status(400).json({ error: 'Project name and code are required' });
        }

        // Find the project by name
        const project = await Project.findOne({ name: projectName });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Update the project's code
        project.code = code;
        await project.save();

        res.status(200).json({ message: 'Code saved successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to save code' });
    }
});

// Unsave Code (Revert to the original code in a project)
router.post('/unsaveCode', authMiddleware, async (req, res) => {
    const { projectName } = req.body;

    try {
        if (!projectName) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        // Find the project by name
        const project = await Project.findOne({ name: projectName });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Revert to the initial code
        project.code = 'console.log("Initial code for project");';
        await project.save();

        res.status(200).json({ message: 'Code reverted to original' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to revert code' });
    }
});

// Fetch Project Code (Using project name and password)
router.get('/:projectName/:pjpassword', async (req, res) => {
    const { projectName, pjpassword } = req.params;

    try {
        // Find the project by name
        const project = await Project.findOne({ name: projectName });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify if the password matches
        const isPasswordMatch = await bcrypt.compare(pjpassword, project.pjpassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid project credentials' });
        }

        // Return the project code if valid credentials
        res.status(200).json({ code: project.code });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to fetch project code' });
    }
});

module.exports = router;
