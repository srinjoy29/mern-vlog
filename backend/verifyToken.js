const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Check for token in cookies first, then in Authorization header if not found
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // If no token is found
  if (!token) {
    return res.status(401).json("You are not authenticated!");
  }

  // Verify the token with the secret
  jwt.verify(token, process.env.SECRET, (err, data) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }

    // Attach user ID to the request object
    req.userId = data._id;

    // Continue to the next middleware or route handler
    next();
  });
};

module.exports = verifyToken;