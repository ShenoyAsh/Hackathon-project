const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Register new user with role
exports.registerUser = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, fullName, role = 'citizen' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (!['citizen', 'expert', 'authority'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
        emailVerified: false
      });

      // Set custom claims for role
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });

      // Create user profile in Firestore
      const userData = {
        uid: userRecord.uid,
        email,
        fullName,
        role,
        emailVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        reportsCount: 0,
        votesCount: 0,
        profile: {
          bio: '',
          location: '',
          phone: '',
          organization: role === 'expert' || role === 'authority' ? '' : null
        },
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          language: 'en'
        }
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      // Generate custom token for client
      const customToken = await admin.auth().createCustomToken(userRecord.uid, { role });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          uid: userRecord.uid,
          email,
          fullName,
          role,
          emailVerified: false
        },
        token: customToken
      });

    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'Email already exists' });
      } else if (authError.code === 'auth/invalid-email') {
        return res.status(400).json({ error: 'Invalid email address' });
      } else if (authError.code === 'auth/weak-password') {
        return res.status(400).json({ error: 'Password is too weak' });
      }
      throw authError;
    }

  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user and return custom token
exports.loginUser = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Note: In a real implementation, you'd use Firebase Client SDK on the frontend
      // For this demo, we'll verify the user exists and return a custom token
      const userRecord = await admin.auth().getUserByEmail(email);

      // Get user's custom claims
      const user = await admin.auth().getUser(userRecord.uid);
      const customClaims = user.customClaims || {};

      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      // Generate custom token
      const customToken = await admin.auth().createCustomToken(userRecord.uid, {
        role: customClaims.role || 'citizen'
      });

      res.status(200).json({
        message: 'Login successful',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          fullName: userRecord.displayName || userData.fullName,
          role: customClaims.role || 'citizen',
          emailVerified: userRecord.emailVerified,
          profile: userData.profile || {},
          preferences: userData.preferences || {}
        },
        token: customToken
      });

    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw authError;
    }

  } catch (error) {
    logger.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
exports.getUserProfile = onRequest({
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
    const decodedToken = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    const authUser = await admin.auth().getUser(decodedToken.uid);

    res.status(200).json({
      uid: decodedToken.uid,
      email: authUser.email,
      fullName: authUser.displayName || userData.fullName,
      role: decodedToken.role || 'citizen',
      emailVerified: authUser.emailVerified,
      createdAt: userData.createdAt,
      reportsCount: userData.reportsCount || 0,
      votesCount: userData.votesCount || 0,
      profile: userData.profile || {},
      preferences: userData.preferences || {}
    });

  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
exports.updateUserProfile = onRequest({
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

    const { fullName, profile, preferences } = req.body;
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (fullName) {
      updateData.fullName = fullName;
      // Also update Firebase Auth display name
      await admin.auth().updateUser(decodedToken.uid, { displayName: fullName });
    }

    if (profile) {
      updateData.profile = profile;
    }

    if (preferences) {
      updateData.preferences = preferences;
    }

    await db.collection('users').doc(decodedToken.uid).update(updateData);

    res.status(200).json({ message: 'Profile updated successfully' });

  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (authority only)
exports.updateUserRole = onRequest({
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

    // Check if current user has authority role
    const currentUserDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!currentUserDoc.exists || currentUserDoc.data().role !== 'authority') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { targetUserId, newRole } = req.body;

    if (!targetUserId || !newRole) {
      return res.status(400).json({ error: 'Target user ID and new role are required' });
    }

    if (!['citizen', 'expert', 'authority'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Update custom claims
    await admin.auth().setCustomUserClaims(targetUserId, { role: newRole });

    // Update Firestore profile
    await db.collection('users').doc(targetUserId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: 'User role updated successfully' });

  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (expert/authority only)
exports.getAllUsers = onRequest({
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
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user has expert or authority role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !['expert', 'authority'].includes(userDoc.data().role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      page = 1,
      limit = 20,
      role,
      search
    } = req.query;

    let query = db.collection('users').orderBy('createdAt', 'desc');

    // Apply filters
    if (role) {
      query = query.where('role', '==', role);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.offset(offset).limit(parseInt(limit)).get();

    const users = [];

    for (const doc of snapshot.docs) {
      const userData = {
        uid: doc.id,
        ...doc.data()
      };

      // Remove sensitive information
      delete userData.preferences;

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const fullName = (userData.fullName || '').toLowerCase();
        const email = (userData.email || '').toLowerCase();

        if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
          continue;
        }
      }

      users.push(userData);
    }

    // Get total count
    const countSnapshot = await db.collection('users').get();

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countSnapshot.size,
        pages: Math.ceil(countSnapshot.size / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
exports.deleteUser = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  try {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { targetUserId } = req.params;
    const userIdToDelete = targetUserId || decodedToken.uid;

    // Users can only delete their own account unless they are authority
    if (userIdToDelete !== decodedToken.uid) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'authority') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    // Delete user from Firebase Auth
    await admin.auth().deleteUser(userIdToDelete);

    // Delete user profile from Firestore
    await db.collection('users').doc(userIdToDelete).delete();

    // Note: In a real implementation, you might want to soft delete
    // or transfer ownership of reports/votes instead of hard deleting

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
