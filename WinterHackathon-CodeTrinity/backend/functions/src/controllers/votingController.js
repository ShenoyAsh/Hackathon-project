const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
const db = admin.firestore();

// Create a new voting session
exports.createVotingSession = onRequest({
  cors: true,
  region: "us-central1",
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

    // Check if user has authority role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'authority') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      title,
      description,
      reportIds,
      startDate,
      endDate,
      votingType = 'community',
      minVotesRequired = 10
    } = req.body;

    if (!title || !description || !reportIds || !Array.isArray(reportIds)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (reportIds.length === 0) {
      return res.status(400).json({ error: 'At least one report must be included' });
    }

    // Validate that all reports exist and are approved
    const reportPromises = reportIds.map(reportId =>
      db.collection('reports').doc(reportId).get()
    );

    const reportDocs = await Promise.all(reportPromises);
    const invalidReports = reportDocs.filter(doc => !doc.exists || doc.data().status !== 'approved');

    if (invalidReports.length > 0) {
      return res.status(400).json({
        error: 'Some reports are invalid or not approved',
        invalidReports: invalidReports.map((doc, index) => reportIds[index])
      });
    }

    const sessionData = {
      title,
      description,
      reportIds,
      votingType,
      startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
      endDate: admin.firestore.Timestamp.fromDate(new Date(endDate)),
      minVotesRequired,
      status: 'active',
      createdBy: decodedToken.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      totalVotes: 0,
      supportVotes: 0,
      opposeVotes: 0,
      abstainVotes: 0
    };

    const sessionRef = await db.collection('votingSessions').add(sessionData);
    const session = await sessionRef.get();

    res.status(201).json({
      id: sessionRef.id,
      ...session.data()
    });

  } catch (error) {
    logger.error('Error creating voting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all voting sessions
exports.getVotingSessions = onRequest({
  cors: true,
  region: "us-central1",
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

    const {
      page = 1,
      limit = 10,
      status,
      votingType
    } = req.query;

    let query = db.collection('votingSessions').orderBy('createdAt', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (votingType) {
      query = query.where('votingType', '==', votingType);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.offset(offset).limit(parseInt(limit)).get();

    const sessions = [];

    for (const doc of snapshot.docs) {
      const sessionData = {
        id: doc.id,
        ...doc.data()
      };

      // Get report details for each session
      const reportPromises = sessionData.reportIds.map(reportId =>
        db.collection('reports').doc(reportId).get()
      );

      const reportDocs = await Promise.all(reportPromises);
      sessionData.reports = reportDocs.map(reportDoc => ({
        id: reportDoc.id,
        ...reportDoc.data()
      }));

      // Check if current user has voted
      const userVote = await db.collection('votingSessions')
        .doc(doc.id)
        .collection('votes')
        .where('userId', '==', token.uid)
        .get();

      sessionData.userHasVoted = !userVote.empty;
      sessionData.userVote = userVote.empty ? null : userVote.docs[0].data().vote;

      sessions.push(sessionData);
    }

    // Get total count
    const countQuery = db.collection('votingSessions');
    let countSnapshot;

    if (status || votingType) {
      let countQueryFiltered = countQuery;
      if (status) countQueryFiltered = countQueryFiltered.where('status', '==', status);
      if (votingType) countQueryFiltered = countQueryFiltered.where('votingType', '==', votingType);
      countSnapshot = await countQueryFiltered.get();
    } else {
      countSnapshot = await countQuery.get();
    }

    res.status(200).json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countSnapshot.size,
        pages: Math.ceil(countSnapshot.size / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting voting sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on a voting session
exports.voteOnSession = onRequest({
  cors: true,
  region: "us-central1",
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

    const { sessionId, vote, reportId } = req.body;

    if (!sessionId || !vote) {
      return res.status(400).json({ error: 'Session ID and vote are required' });
    }

    if (!['support', 'oppose', 'abstain'].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if session exists and is active
    const sessionDoc = await db.collection('votingSessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Voting session not found' });
    }

    const sessionData = sessionDoc.data();

    if (sessionData.status !== 'active') {
      return res.status(400).json({ error: 'Voting session is not active' });
    }

    const now = admin.firestore.Timestamp.now();
    if (now < sessionData.startDate || now > sessionData.endDate) {
      return res.status(400).json({ error: 'Voting is not currently open' });
    }

    // Check if user already voted
    const existingVote = await db.collection('votingSessions')
      .doc(sessionId)
      .collection('votes')
      .where('userId', '==', decodedToken.uid)
      .get();

    if (!existingVote.empty) {
      return res.status(400).json({ error: 'User has already voted in this session' });
    }

    // Validate reportId if provided
    if (reportId && !sessionData.reportIds.includes(reportId)) {
      return res.status(400).json({ error: 'Report ID is not part of this voting session' });
    }

    // Create vote
    await db.collection('votingSessions')
      .doc(sessionId)
      .collection('votes')
      .add({
        userId: decodedToken.uid,
        vote,
        reportId: reportId || null,
        votedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Update session vote counts
    const updateData = {
      totalVotes: admin.firestore.FieldValue.increment(1)
    };

    if (vote === 'support') {
      updateData.supportVotes = admin.firestore.FieldValue.increment(1);
    } else if (vote === 'oppose') {
      updateData.opposeVotes = admin.firestore.FieldValue.increment(1);
    } else {
      updateData.abstainVotes = admin.firestore.FieldValue.increment(1);
    }

    await db.collection('votingSessions').doc(sessionId).update(updateData);

    // Check if minimum votes reached and auto-close if needed
    const updatedSession = await db.collection('votingSessions').doc(sessionId).get();
    const updatedData = updatedSession.data();

    if (updatedData.totalVotes >= updatedData.minVotesRequired) {
      await db.collection('votingSessions').doc(sessionId).update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.status(201).json({
      message: 'Vote recorded successfully',
      sessionStatus: updatedData.totalVotes >= updatedData.minVotesRequired ? 'completed' : 'active'
    });

  } catch (error) {
    logger.error('Error voting on session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get voting results for a session
exports.getVotingResults = onRequest({
  cors: true,
  region: "us-central1",
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

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const sessionDoc = await db.collection('votingSessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Voting session not found' });
    }

    const sessionData = {
      id: sessionDoc.id,
      ...sessionDoc.data()
    };

    // Get all votes for this session
    const votesSnapshot = await db.collection('votingSessions')
      .doc(sessionId)
      .collection('votes')
      .get();

    const votes = [];
    const voteBreakdown = {
      support: 0,
      oppose: 0,
      abstain: 0
    };

    votesSnapshot.forEach(doc => {
      const voteData = doc.data();
      votes.push({
        id: doc.id,
        ...voteData
      });
      voteBreakdown[voteData.vote]++;
    });

    // Get report-specific breakdown if available
    const reportBreakdown = {};
    if (sessionData.reportIds && sessionData.reportIds.length > 1) {
      for (const reportId of sessionData.reportIds) {
        const reportVotes = votes.filter(vote => vote.reportId === reportId);
        reportBreakdown[reportId] = {
          total: reportVotes.length,
          support: reportVotes.filter(v => v.vote === 'support').length,
          oppose: reportVotes.filter(v => v.vote === 'oppose').length,
          abstain: reportVotes.filter(v => v.vote === 'abstain').length
        };
      }
    }

    res.status(200).json({
      session: sessionData,
      totalVotes: votes.length,
      voteBreakdown,
      reportBreakdown,
      votes: votes.map(v => ({
        userId: v.userId,
        vote: v.vote,
        reportId: v.reportId,
        votedAt: v.votedAt
      }))
    });

  } catch (error) {
    logger.error('Error getting voting results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close voting session (authority only)
exports.closeVotingSession = onRequest({
  cors: true,
  region: "us-central1",
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

    // Check if user has authority role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'authority') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { sessionId } = req.params;
    const { status, reason } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      closedBy: decodedToken.uid,
      closedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (reason) {
      updateData.closureReason = reason;
    }

    await db.collection('votingSessions').doc(sessionId).update(updateData);

    res.status(200).json({ message: 'Voting session closed successfully' });

  } catch (error) {
    logger.error('Error closing voting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
