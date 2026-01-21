const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

const db = admin.firestore();

// Create new partner (Admin/Authority only)
exports.createPartner = onRequest({
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

        // Check permissions
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || !['authority', 'admin'].includes(userDoc.data().role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const { name, type, description, contributions, logoUrl, website } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        const partnerData = {
            name,
            type, // 'corporate', 'ngo', 'government'
            description: description || '',
            contributions: contributions || [], // List of funded projects or resources
            logoUrl: logoUrl || '',
            website: website || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: decodedToken.uid
        };

        const docRef = await db.collection('partners').add(partnerData);

        res.status(201).json({
            id: docRef.id,
            ...partnerData
        });

    } catch (error) {
        logger.error('Error creating partner:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all partners
exports.getPartners = onRequest({
    cors: true,
    region: "us-central1",
}, async (req, res) => {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const snapshot = await db.collection('partners').orderBy('name').get();

        const partners = [];
        snapshot.forEach(doc => {
            partners.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({ partners });

    } catch (error) {
        logger.error('Error getting partners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
