import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Utilizator from "../models/utilizatorModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Utilizator.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const admin = (request, response, next) => {
  if (request.user && request.user.esteAdministrator) {
    next();
  } else {
    response.status(401);
    throw new Error("Not authrozied as an admin");
  }
};

export { protect, admin };
