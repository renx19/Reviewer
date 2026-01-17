// const User = require('../Models/user');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // =========================
// // COOKIE CONFIG (LIVE)
// // =========================
// const cookieOptions = {
//   httpOnly: true,
//   secure: true,     // required for HTTPS (Render)
//   sameSite: "None", // required for mobile cross-site cookies
//   path: '/',
// };

// // =========================
// // LOCAL DEV VERSION (COMMENTED)
// // =========================

// // const cookieOptions = {
// //   httpOnly: true,
// //   secure: false,
// //   sameSite: "Lax",
// //   path: '/',
// // };


// // =========================
// // Refresh Access Token
// // =========================
// const refreshToken = async (req, res) => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (!token) return res.status(401).json({ error: 'No refresh token provided.' });

//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

//     const user = await User.findById(decoded.userId);
//     if (!user || user.refreshToken !== token) {
//       return res.status(403).json({ error: 'Invalid refresh token.' });
//     }

//     const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '15m',
//     });

//     res.cookie('accessToken', accessToken, {
//       ...cookieOptions,
//       maxAge: 15 * 60 * 1000,
//     });

//     return res.status(200).json({ message: 'Access token refreshed.' });

//   } catch (err) {
//     console.error(err);
//     return res.status(403).json({ error: 'Failed to refresh access token.' });
//   }
// };

// // =========================
// // Login User
// // =========================
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({ error: 'Invalid credentials.' });
//     }

//     const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

//     user.refreshToken = refreshToken;
//     await user.save();

//     res.cookie('accessToken', accessToken, {
//       ...cookieOptions,
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie('refreshToken', refreshToken, {
//       ...cookieOptions,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({ message: 'Login successful.' });

//   } catch (err) {
//     console.error('Login error:', err.message);
//     return res.status(500).json({ error: 'Error logging in.' });
//   }
// };

// // =========================
// // Logout User
// // =========================
// const logoutUser = async (req, res) => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (!token) return res.status(400).json({ error: 'No refresh token found.' });

//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

//     const user = await User.findById(decoded.userId);
//     if (user) {
//       user.refreshToken = null;
//       await user.save();
//     }

//     res.clearCookie('accessToken', cookieOptions);
//     res.clearCookie('refreshToken', cookieOptions);

//     return res.status(200).json({ message: 'Logout successful.' });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'Error logging out.' });
//   }
// };

// // =========================
// // Create User
// // =========================
// const createUser = async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     return res.status(201).json({ message: 'User created successfully.' });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'Error creating user.', message: err.message });
//   }
// };




// module.exports = {
//   refreshToken,
//   loginUser,
//   logoutUser,
//   createUser,
// };


const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =========================
// COOKIE CONFIG
// =========================
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: '/',
};

// =========================
// LOGIN USER
// =========================
const loginUser = async (req, res) => {
  const { email, password, clientType } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

    // Always send refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (clientType === 'web') {
      // Web: access token in cookie
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
      return res.status(200).json({ message: 'Login successful.' });
    } else {
      // Mobile: access token in response body
      return res.status(200).json({ message: 'Login successful.', accessToken });
    }

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Error logging in.' });
  }
};

// =========================
// REFRESH TOKEN
// =========================
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: 'Invalid refresh token.' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const clientType = req.body?.clientType || 'web';
    if (clientType === 'web') {
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
      return res.status(200).json({ message: 'Access token refreshed.' });
    } else {
      return res.status(200).json({ message: 'Access token refreshed.', accessToken });
    }

  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Failed to refresh access token.' });
  }
};

// =========================
// LOGOUT USER
// =========================
const logoutUser = async (req, res) => {
  try {
    let token = req.cookies.refreshToken;

    // Try header if cookie not present
    if (!token && req.headers.authorization) {
      const headerToken = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(headerToken, process.env.JWT_REFRESH_SECRET);
        token = headerToken;
      } catch {
        token = null; // invalid header token
      }
    }

    if (!token) {
      // Clear cookies anyway
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(200).json({ message: 'Logged out (no valid token found).' });
    }

    // Invalidate refresh token in DB
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({ message: 'Logout successful.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error logging out.' });
  }
};

// =========================
// Create User
// =========================
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User created successfully.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error creating user.', message: err.message });
  }
};


module.exports = {
  loginUser,
  refreshToken,
  logoutUser,
  createUser
};
