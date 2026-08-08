const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const controller = require('../controllers/employee.controller');

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee feedback endpoints
 */

/**
 * @swagger
 * /api/me:
 *   get:
 *     tags: [Employee]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 company_id:
 *                   type: string
 *                 company_name:
 *                   type: string
 *                 manager_id:
 *                   type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, controller.getProfile);

/**
 * @swagger
 * /api/me/team:
 *   get:
 *     tags: [Employee]
 *     summary: Get user's direct reports
 *     security: [{ bearerAuth: [] }]
 */
router.get('/me/team', authenticate, controller.getTeam);

/**
 * @swagger
 * /api/me/team/{employeeId}/feedback:
 *   post:
 *     tags: [Employee]
 *     summary: Initiate feedback for a direct report for the current open period
 *     security: [{ bearerAuth: [] }]
 */
router.post('/me/team/:employeeId/feedback', authenticate, controller.initiateFeedback);

/**
 * @swagger
 * /api/me/feedback/given:
 *   get:
 *     tags: [Employee]
 *     summary: Get feedback assignments where you are the reviewer
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of assignments
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
 *                     enum: [PENDING, DRAFT, SUBMITTED]
 *                   recipient_name:
 *                     type: string
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 */
router.get('/me/feedback/given', authenticate, controller.getFeedbackGiven);

/**
 * @swagger
 * /api/me/feedback/received:
 *   get:
 *     tags: [Employee]
 *     summary: Get feedback you have received (submitted only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of received feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   assignment_id:
 *                     type: string
 *                   reviewer_name:
 *                     type: string
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   submitted_at:
 *                     type: string
 */
router.get('/me/feedback/received', authenticate, controller.getFeedbackReceived);

/**
 * @swagger
 * /api/me/feedback/history:
 *   get:
 *     tags: [Employee]
 *     summary: Get historical scores grouped by parameter
 *     description: Returns scores across months for each parameter, suitable for trend charts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Historical scores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   parameterId:
 *                     type: string
 *                   parameterName:
 *                     type: string
 *                   displayOrder:
 *                     type: integer
 *                   scores:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         month:
 *                           type: integer
 *                         year:
 *                           type: integer
 *                         score:
 *                           type: integer
 *                         comment:
 *                           type: string
 */
router.get('/me/feedback/history', authenticate, controller.getFeedbackHistory);

/**
 * @swagger
 * /api/me/feedback/received/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get detail of specific received feedback
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback assignment ID
 *     responses:
 *       200:
 *         description: Feedback detail with scores and comments
 *       403:
 *         description: Not the recipient
 *       404:
 *         description: Not found
 */
router.get('/me/feedback/received/:id', authenticate, controller.getReceivedFeedbackDetail);

/**
 * @swagger
 * /api/feedback/assignments/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get a feedback assignment (as reviewer)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment with feedback data and parameters
 *       403:
 *         description: Not the reviewer or wrong company
 *       404:
 *         description: Assignment not found
 */
router.get('/assignments/:id', authenticate, controller.getAssignment);

/**
 * @swagger
 * /api/feedback/assignments/{id}/draft:
 *   post:
 *     tags: [Employee]
 *     summary: Save feedback as draft
 *     description: Saves partial feedback. Scores and comments are optional. Cannot draft after submission.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parameterId:
 *                       type: string
 *                     score:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                       nullable: true
 *                     comment:
 *                       type: string
 *                       nullable: true
 *     responses:
 *       200:
 *         description: Draft saved
 *       400:
 *         description: Already submitted or validation error
 */
router.post('/assignments/:id/draft', authenticate, controller.saveDraft);

/**
 * @swagger
 * /api/feedback/assignments/{id}/submit:
 *   post:
 *     tags: [Employee]
 *     summary: Submit feedback
 *     description: Requires all 5 parameters with scores (1-5) and non-empty comments. Cannot submit twice.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [parameterId, score, comment]
 *                   properties:
 *                     parameterId:
 *                       type: string
 *                     score:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                     comment:
 *                       type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation error, already submitted, or period closed
 */
router.post('/assignments/:id/submit', authenticate, controller.submitFeedback);

module.exports = router;
