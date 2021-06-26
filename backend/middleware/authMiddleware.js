import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Utilizator from "../models/utilizatorModel.js";

const protect = asyncHandler(async (request, response, next) => {
  let token;
  const authorizationHeader = request.headers && request.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    try {
      token = authorizationHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await Utilizator.findById(decoded.id).select("-password");

      if (!user) {
        response.status(404);
        throw new Error("Utilizatorul nu a fost gasit!");
      }

      request.user = user;

      next();
    } catch (error) {
      response.status(401);
      throw new Error(
        "Utilizatorul nu a fost autorizat, verificarea token a esuat!"
      );
    }
  }

  if (!token) {
    response.status(401);
    throw new Error(
      "Utilizatorul nu a fost autorizat, verificarea token a esuat!"
    );
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
