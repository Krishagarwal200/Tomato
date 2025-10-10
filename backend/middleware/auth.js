import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") || req.headers.token;

  // console.log("Auth Token:", token); // Debug log

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ CORRECT: Set user info in req.user, not req.body
    req.user = {
      id: token_decode.id,
      ...token_decode, // Include any other token data
    };
    req.userId = token_decode.id; // Direct access for convenience

    // console.log("Authenticated user ID:", token_decode.id); // Debug log
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);

    // Specific error messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }
  }
};

export default authMiddleware;
