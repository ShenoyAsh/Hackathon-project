const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const aiService = require('../services/aiService');

const db = admin.firestore();

// Analyze report with AI
exports.analyzeReport = onRequest({
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

    // Check if user has expert role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !['expert', 'authority'].includes(userDoc.data().role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { reportId, imageUrl, reportType, location, description } = req.body;

    if (!reportId || !reportType || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Analyze image if provided
    let imageAnalysis = null;
    if (imageUrl) {
      imageAnalysis = await aiService.analyzeImage(imageUrl);
    }

    // 2. Get AI Analysis
    const aiAnalysis = await aiService.generateReportAnalysis({
      reportType,
      location,
      description,
      imageAnalysis
    });

    // 3. Save to Firestore
    const analysisData = {
      reportId,
      imageAnalysis,
      aiAnalysis,
      feasibilityScore: aiAnalysis.feasibilityScore || 0,
      impactScore: aiAnalysis.impactScore || 0,
      recommendations: aiAnalysis.recommendations || [],
      analyzedBy: decodedToken.uid,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    };

    await db.collection('reports')
      .doc(reportId)
      .collection('analysis')
      .add(analysisData);

    // Update report with analysis summary
    await db.collection('reports').doc(reportId).update({
      aiAnalysis: {
        feasibilityScore: analysisData.feasibilityScore,
        impactScore: analysisData.impactScore,
        recommendations: analysisData.recommendations.slice(0, 3), // Top 3 recommendations
        analyzedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    res.status(200).json({
      success: true,
      analysis: analysisData
    });

  } catch (error) {
    logger.error('Error in analyzeReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analysis for a report
exports.getReportAnalysis = onRequest({
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

    const { reportId } = req.params;
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    const analysisSnapshot = await db.collection('reports')
      .doc(reportId)
      .collection('analysis')
      .orderBy('analyzedAt', 'desc')
      .limit(1)
      .get();

    if (analysisSnapshot.empty) {
      return res.status(404).json({ error: 'No analysis found for this report' });
    }

    const analysis = analysisSnapshot.docs[0].data();
    analysis.id = analysisSnapshot.docs[0].id;

    res.status(200).json(analysis);

  } catch (error) {
    logger.error('Error getting report analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch analyze multiple reports (for experts)
exports.batchAnalyzeReports = onRequest({
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

    // Check if user has expert role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !['expert', 'authority'].includes(userDoc.data().role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { reportIds } = req.body;

    if (!reportIds || !Array.isArray(reportIds)) {
      return res.status(400).json({ error: 'Report IDs array is required' });
    }

    if (reportIds.length > 10) {
      return res.status(400).json({ error: 'Cannot analyze more than 10 reports at once' });
    }

    const results = [];

    for (const reportId of reportIds) {
      try {
        const reportDoc = await db.collection('reports').doc(reportId).get();
        if (!reportDoc.exists) {
          results.push({ reportId, error: 'Report not found' });
          continue;
        }

        const reportData = reportDoc.data();

        let imageAnalysis = null;
        if (reportData.imageUrl) {
          imageAnalysis = await aiService.analyzeImage(reportData.imageUrl);
        }

        const aiAnalysis = await aiService.generateReportAnalysis({
          reportType: reportData.reportType,
          location: reportData.location,
          description: reportData.description,
          imageAnalysis
        });

        // Save to Firestore (abbreviated for batch)
        await db.collection('reports').doc(reportId).update({
          aiAnalysis: {
            feasibilityScore: aiAnalysis.feasibilityScore,
            impactScore: aiAnalysis.impactScore,
            recommendations: aiAnalysis.recommendations.slice(0, 3),
            analyzedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        });

        results.push({ reportId, success: true });

      } catch (error) {
        logger.error(`Error analyzing report ${reportId}:`, error);
        results.push({ reportId, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Batch analysis completed',
      results
    });

  } catch (error) {
    logger.error('Error in batchAnalyzeReports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
