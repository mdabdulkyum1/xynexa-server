import express from "express";
import { createTask, getAllTasksBy } from "../controllers/boardController.js";

const router = express.Router();

router.post("/create", createTask);

router.get("/getAllTask", getAllTasksBy);

export default router;