const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Create a new report
exports.createReport = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      // res.set('Access-Control-Allow-Origin', '*'); // Handled by cors:true mostly, but good for safety
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const {
      title,
      description,
      location,
      reportType,
      imageUrl,
      additionalInfo
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !reportType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['unused_space', 'tree_loss', 'heat_hotspot'].includes(reportType)) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    // 1. Create Report in Firestore (Initial state)
    const reportRef = admin.firestore().collection('reports').doc();
    const reportId = reportRef.id;

    await reportRef.set({
      id: reportId,
      title: title || 'New Report',
      description,
      location,
      reportType,
      imageUrl: imageUrl || '',
      additionalInfo: additionalInfo || '',
      userId: decodedToken.uid,
      status: 'pending_analysis', // NEW INITIAL STATUS
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      aiAnalysis: null,
      expertReview: null
      // 3. Update report with analysis
      // 3. Update report with analysis & Move to Next Stage
      const updatePayload = {
        aiAnalysis: {
          ...aiResult,
          analyzedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        status: 'pending_review' // Move to Community Review Stage automatically
      };

      // Auto-correct category if confidence is high (implied by suggestion)
      if(aiResult.suggested_category && aiResult.suggested_category !== reportType) {
      updatePayload.reportType = aiResult.suggested_category;
      updatePayload.originalReportType = reportType; // Keep track of user's original choice
    }

    await reportRef.update(updatePayload);

  } catch (aiError) {
    logger.error("Auto-AI Analysis failed during createReport", aiError);
    // Don't fail the request, just log it. The report is created.
  }

  const report = await reportRef.get();

  // Create user profile if it doesn't exist
  const userRef = db.collection('users').doc(decodedToken.uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email,
      role: 'citizen',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reportsCount: 1,
      votesCount: 0
    });
  } else {
    await userRef.update({
      reportsCount: admin.firestore.FieldValue.increment(1)
    });
  }

  res.status(201).json({
    id: reportRef.id,
    ...report.data()
  });

} catch (error) {
  logger.error('Error creating report:', error);
  res.status(500).json({ error: 'Internal server error' });
}
});

// Get all reports with pagination and filtering
exports.getReports = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).send('');
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    const {
      page = 1,
      limit = 10,
      status,
      reportType,
      userId
    } = req.query;

    let query = db.collection('reports').orderBy('createdAt', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (reportType) {
      query = query.where('reportType', '==', reportType);
    }
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.offset(offset).limit(parseInt(limit)).get();

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get total count for pagination
    const countQuery = db.collection('reports');
    let countSnapshot;

    if (status || reportType || userId) {
      let countQueryFiltered = countQuery;
      if (status) countQueryFiltered = countQueryFiltered.where('status', '==', status);
      if (reportType) countQueryFiltered = countQueryFiltered.where('reportType', '==', reportType);
      if (userId) countQueryFiltered = countQueryFiltered.where('userId', '==', userId);
      countSnapshot = await countQueryFiltered.get();
    } else {
      countSnapshot = await countQuery.get();
    }

    res.status(200).json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countSnapshot.size,
        pages: Math.ceil(countSnapshot.size / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single report by ID
exports.getReport = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    const { reportId } = req.params;
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = {
      id: reportDoc.id,
      ...reportDoc.data()
    };

    // Get votes for this report
    const votesSnapshot = await db.collection('reports')
      .doc(reportId)
      .collection('votes')
      .get();

    const votes = [];
    votesSnapshot.forEach(doc => {
      votes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get comments for this report
    const commentsSnapshot = await db.collection('reports')
      .doc(reportId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = [];
    commentsSnapshot.forEach(doc => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      ...reportData,
      votes,
      comments
    });

  } catch (error) {
    logger.error('Error getting report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report status (for experts and authorities)
exports.updateReportStatus = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user has expert or authority role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !['expert', 'authority'].includes(userDoc.data().role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { reportId } = req.params;
    const { status, expertReview } = req.body;

    if (!reportId || !status) {
      return res.status(400).json({ error: 'Report ID and status are required' });
    }

    if (!['under_review', 'approved', 'rejected', 'implemented'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (expertReview) {
      updateData.expertReview = {
        ...expertReview,
        reviewedBy: decodedToken.uid,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp()
      };
    }

    await db.collection('reports').doc(reportId).update(updateData);

    res.status(200).json({ message: 'Report updated successfully' });

  } catch (error) {
    logger.error('Error updating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on a report
exports.voteOnReport = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { reportId, voteType } = req.body;

    if (!reportId || !voteType) {
      return res.status(400).json({ error: 'Report ID and vote type are required' });
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if report exists
    const reportDoc = await db.collection('reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if user already voted
    const existingVote = await db.collection('reports')
      .doc(reportId)
      .collection('votes')
      .where('userId', '==', decodedToken.uid)
      .get();

    if (!existingVote.empty) {
      return res.status(400).json({ error: 'User has already voted on this report' });
    }

    // Create vote
    await db.collection('reports')
      .doc(reportId)
      .collection('votes')
      .add({
        userId: decodedToken.uid,
        reportId,
        voteType,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Update report vote counts
    const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    await db.collection('reports').doc(reportId).update({
      [updateField]: admin.firestore.FieldValue.increment(1)
    });

    // Update user vote count
    await db.collection('users').doc(decodedToken.uid).update({
      votesCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({ message: 'Vote recorded successfully' });

  } catch (error) {
    logger.error('Error voting on report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
