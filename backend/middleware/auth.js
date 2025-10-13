import jwt from "jsonwebtoken";
import Store from "../models/storeModel.js"; // Import Store model

const authMiddleware = async (req, res, next) => {
  let token;

  // Extract token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.replace("Bearer ", "");
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // For store authentication
    if (token_decode.type === "store") {
      const store = await Store.findById(token_decode.id).select("-password");
      if (!store) {
        return res.status(401).json({
          success: false,
          message: "Store not found.",
        });
      }
      req.store = store; // Attach store to request
      req.storeId = token_decode.id;
    }

    // Set user/store info in request
    req.user = {
      id: token_decode.id,
      type: token_decode.type || "user", // 'user' or 'store'
      ...token_decode,
    };
    req.userId = token_decode.id;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

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
