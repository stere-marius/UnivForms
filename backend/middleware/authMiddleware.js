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

      const user = await Utilizator.findById(decoded.id).select("-password");

      if (!user) {
        res.status(404);
        throw new Error("Utilizatorul nu a fost gasit!");
      }

      req.user = user;

      next();
    } catch (error) {
      console.log(`Not authorized, token failed`);
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    console.log(`Not authorized, no token`);
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
