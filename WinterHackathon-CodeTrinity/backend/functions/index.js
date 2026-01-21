/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const logger = require("firebase-functions/logger");

// Import controllers
const reportController = require('./src/controllers/reportController');
const aiController = require('./src/controllers/aiController');
const votingController = require('./src/controllers/votingController');
const userController = require('./src/controllers/userController');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate to impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override limit for each function using
// `maxInstances` option in function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Export all API endpoints
exports.reports = {
  create: reportController.createReport,
  list: reportController.getReports,
  get: reportController.getReport,
  updateStatus: reportController.updateReportStatus,
  vote: reportController.voteOnReport
};

exports.ai = {
  analyze: aiController.analyzeReport,
  getAnalysis: aiController.getReportAnalysis,
  batchAnalyze: aiController.batchAnalyzeReports
};

exports.voting = {
  createSession: votingController.createVotingSession,
  getSessions: votingController.getVotingSessions,
  vote: votingController.voteOnSession,
  getResults: votingController.getVotingResults,
  closeSession: votingController.closeVotingSession
};

exports.users = {
  register: userController.registerUser,
  login: userController.loginUser,
  getProfile: userController.getUserProfile,
  updateProfile: userController.updateUserProfile,
  updateRole: userController.updateUserRole,
  getAll: userController.getAllUsers,
  delete: userController.deleteUser
};

const partnerController = require('./src/controllers/partnerController');

exports.partners = {
  create: partnerController.createPartner,
  getAll: partnerController.getPartners
};

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
