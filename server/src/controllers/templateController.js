import AmpTemplate from "../models/AmpTemplate.js";
import { extractTemplateVariables } from "../utils/generateAmpTemplate.js";

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      slug,
      subject,
      html,
      amp,
      formHtml,
      text,
      isActive
    } = req.body;

    if (!name || !html) {
      return res.status(400).json({
        success: false,
        message: "Template name and html are required"
      });
    }

    const template = await AmpTemplate.create({
      name,
      slug: slug || createSlug(name),
      subject,
      html,
      amp,
      formHtml,
      text,
      isActive,
      variables: extractTemplateVariables(html, amp, formHtml, subject)
    });

    return res.status(201).json({
      success: true,
      message: "Template saved",
      template
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Template slug already exists"
      });
    }

    console.error("CREATE TEMPLATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Template save failed"
    });
  }
};

export const listTemplates = async (req, res) => {
  try {
    const templates = await AmpTemplate
      .find()
      .select("-html -amp")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      templates
    });
  } catch (err) {
    console.error("LIST TEMPLATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Template list failed"
    });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const template = await AmpTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found"
      });
    }

    return res.json({
      success: true,
      template
    });
  } catch (err) {
    console.error("GET TEMPLATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Template fetch failed"
    });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.html || update.amp || update.formHtml || update.subject) {
      update.variables = extractTemplateVariables(
        update.html,
        update.amp,
        update.formHtml,
        update.subject
      );
    }

    const template = await AmpTemplate.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true
      }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found"
      });
    }

    return res.json({
      success: true,
      message: "Template updated",
      template
    });
  } catch (err) {
    console.error("UPDATE TEMPLATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Template update failed"
    });
  }
};
