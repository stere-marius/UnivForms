import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destionation(request, file, cb) {
    cb(null, "uploads/");
  },
  filename(request, file, cb) {},
});
