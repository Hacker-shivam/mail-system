import express from "express";

import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate
} from "../controllers/templateController.js";

const router = express.Router();

router.post("/", createTemplate);

router.get("/", listTemplates);

router.get("/:id", getTemplate);

router.put("/:id", updateTemplate);

export default router;
