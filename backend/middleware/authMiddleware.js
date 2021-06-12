import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Utilizator from "../models/utilizatorModel.js";

const protect = asyncHandler(async (request, response, next) => {
  let token;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = request.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await Utilizator.findById(decoded.id).select("-password");

      if (!user) {
        response.status(404);
        throw new Error("Utilizatorul nu a fost gasit!");
      }

      request.user = user;

      next();
    } catch (error) {
      console.log(`Not authorized, token failed`);
      console.error(error);
      response.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    console.log(`Not authorized, no token`);
    response.status(401);
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
