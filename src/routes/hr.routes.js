const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/hr.controller');

/**
 * @swagger
 * tags:
 *   name: HR
 *   description: HR dashboard and monitoring endpoints
 */

/**
 * @swagger
 * /api/hr/employees:
 *   get:
 *     tags: [HR]
 *     summary: List all employees in the company
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   manager_id:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *       403:
 *         description: Not HR role
 */
router.get('/employees', authenticate, authorize('HR', 'ADMIN'), controller.getEmployees);

/**
 * @swagger
 * /api/hr/review-periods:
 *   get:
 *     tags: [HR]
 *     summary: List all review periods for the company
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of review periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   month:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [DRAFT, OPEN, CLOSED]
 *                   start_date:
 *                     type: string
 *                   end_date:
 *                     type: string
 */
router.get('/review-periods', authenticate, authorize('HR', 'ADMIN'), controller.getReviewPeriods);

/**
 * @swagger
 * /api/hr/review-periods/{id}/status:
 *   get:
 *     tags: [HR]
 *     summary: Get completion status for a review period
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review period ID
 *     responses:
 *       200:
 *         description: Completion statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     year:
 *                       type: integer
 *                     month:
 *                       type: integer
 *                     status:
 *                       type: string
 *                 total:
 *                   type: integer
 *                 submitted:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 completionPercentage:
 *                   type: number
 *       404:
 *         description: Review period not found
 */
router.get('/review-periods/:id/status', authenticate, authorize('HR', 'ADMIN'), controller.getReviewPeriodStatus);

/**
 * @swagger
 * /api/hr/review-periods/{id}/pending:
 *   get:
 *     tags: [HR]
 *     summary: Get pending/draft assignments for a review period
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review period ID
 *     responses:
 *       200:
 *         description: List of pending/draft assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   reviewer_name:
 *                     type: string
 *                   recipient_name:
 *                     type: string
 */
router.get('/review-periods/:id/pending', authenticate, authorize('HR', 'ADMIN'), controller.getPendingAssignments);

/**
 * @swagger
 * /api/hr/review-periods/{id}/assignments:
 *   get:
 *     tags: [HR]
 *     summary: Get all assignments for a review period
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review period ID
 *     responses:
 *       200:
 *         description: All assignments with status
 */
router.get('/review-periods/:id/assignments', authenticate, authorize('HR', 'ADMIN'), controller.getAllAssignments);

/**
 * @swagger
 * /api/hr/feedback:
 *   get:
 *     tags: [HR]
 *     summary: Get submitted feedback for the company
 *     description: Returns submitted feedback grouped by assignment. Supports filtering by review period, reviewer, and recipient.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: reviewPeriodId
 *         schema:
 *           type: string
 *         description: Filter by review period
 *       - in: query
 *         name: reviewerId
 *         schema:
 *           type: string
 *         description: Filter by reviewer
 *       - in: query
 *         name: recipientId
 *         schema:
 *           type: string
 *         description: Filter by recipient
 *     responses:
 *       200:
 *         description: Submitted feedback grouped by assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   assignmentId:
 *                     type: string
 *                   reviewerName:
 *                     type: string
 *                   recipientName:
 *                     type: string
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   submittedAt:
 *                     type: string
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         parameterName:
 *                           type: string
 *                         score:
 *                           type: integer
 *                         comment:
 *                           type: string
 */
router.get('/feedback', authenticate, authorize('HR', 'ADMIN'), controller.getFeedback);

module.exports = router;
