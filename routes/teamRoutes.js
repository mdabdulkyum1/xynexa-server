import express from "express";
import {
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  getUserTeams,
  getUserTeamsByEmail, 
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/create", createTeam); // Create team
router.get("/:id", getTeam); // Get team by ID

router.get("/user/teams/:userId", getUserTeams); // Get user's teams (ID from params)
router.get("/user/teams/email/:userEmail", getUserTeamsByEmail); // Get user's teams (email from params) // new line added
router.put("/:id", updateTeam); // Update team
router.delete("/:id", deleteTeam); // Delete team
router.post("/addMember", addMemberToTeam); // Add member to team

export default router;