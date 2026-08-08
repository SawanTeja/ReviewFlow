const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/admin.controller');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management endpoints
 */

/**
 * @swagger
 * /api/admin/companies:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new company
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Company Inc
 *     responses:
 *       201:
 *         description: Company created
 *       400:
 *         description: Missing name
 */
router.post('/companies', authenticate, authorize('ADMIN', 'HR'), controller.createCompany);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new user
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, name, email, password]
 *             properties:
 *               companyId:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: New Employee
 *               email:
 *                 type: string
 *                 example: new@company.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [EMPLOYEE, HR, ADMIN]
 *                 default: EMPLOYEE
 *               managerId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Missing fields or invalid manager
 *       409:
 *         description: Email already in use
 */
router.post('/users', authenticate, authorize('ADMIN', 'HR'), controller.createUser);

/**
 * @swagger
 * /api/admin/review-periods:
 *   post:
 *     tags: [Admin]
 *     summary: Create a review period
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, year, month]
 *             properties:
 *               companyId:
 *                 type: string
 *               year:
 *                 type: integer
 *                 example: 2026
 *               month:
 *                 type: integer
 *                 example: 9
 *               status:
 *                 type: string
 *                 enum: [DRAFT, OPEN, CLOSED]
 *                 default: OPEN
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Review period created
 *       409:
 *         description: Period already exists for this company/month/year
 */
router.post('/review-periods', authenticate, authorize('ADMIN', 'HR'), controller.createReviewPeriod);

/**
 * @swagger
 * /api/admin/feedback-assignments:
 *   post:
 *     tags: [Admin]
 *     summary: Create a feedback assignment
 *     description: Assigns a reviewer to give feedback to a recipient for a specific review period. Both must belong to the same company.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, reviewPeriodId, reviewerId, recipientId]
 *             properties:
 *               companyId:
 *                 type: string
 *               reviewPeriodId:
 *                 type: string
 *               reviewerId:
 *                 type: string
 *               recipientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assignment created
 *       400:
 *         description: Cross-company violation or self-review
 *       409:
 *         description: Assignment already exists
 */
router.post('/feedback-assignments', authenticate, authorize('ADMIN', 'HR'), controller.createFeedbackAssignment);

module.exports = router;
