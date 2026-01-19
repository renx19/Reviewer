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
    // Get access token from cookie or Authorization header
    let accessToken = null;

    if (req.cookies && req.cookies.accessToken) {
      accessToken = req.cookies.accessToken;
    } else if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        accessToken = parts[1];
      }
    }

    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided." });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Access token expired." });
      }
      return res.status(403).json({ error: "Invalid access token." });
    }

    // Fetch user
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found." });

    // Attach to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Server error in authentication." });
  }
};

module.exports = authenticateUser;
