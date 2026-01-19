// // middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../Models/user');

// const authenticateUser = async (req, res, next) => {
//   try {
//     const accessToken = req.cookies.accessToken;

//     if (!accessToken) {
//       return res.status(401).json({ error: 'No access token provided.' });
//     }

//     // Verify access token
//     const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

//     // Attach user to request
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({ error: 'User not found.' });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     if (err.name === 'TokenExpiredError') {
//       // Access token expired, ask client to call /refresh
//       return res.status(401).json({ error: 'Access token expired.' });
//     }
//     console.error(err);
//     return res.status(403).json({ error: 'Invalid access token.' });
//   }
// };

// module.exports = authenticateUser;
// authMiddleware.js

// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../Models/user');

const authenticateUser = async (req, res, next) => {
  try {
    // Use access token from either cookie OR Authorization header
    const accessToken = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired.' });
    }
    console.error(err);
    return res.status(403).json({ error: 'Invalid access token.' });
  }
};

module.exports = authenticateUser;
