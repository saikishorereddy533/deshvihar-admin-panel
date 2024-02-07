const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package');

// Create a new gym package
router.get('/create-package', packageController.getCreatePackage);

router.post('/packages', packageController.createPackage);

// Get all gym packages
router.get('/packages', packageController.getPackageList);

router.get('/get-packages', packageController.getPackageListJson);

// Get a specific gym package by ID
router.get('/packages/:id', packageController.getPackageById);

// Update a gym package by ID
router.put('/packages/:id', packageController.updatePackage);

// Delete a gym package by ID
router.delete('/packages/:id', packageController.deletePackage);

module.exports = router;