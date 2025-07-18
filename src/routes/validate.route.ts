import express from "express";
import { schemas, DynamicValidationRequest } from "../schemas";
import validatePassword from "../validators/passwordValidator";
import isSuspiciousEmailUsername from "../validators/emailUsernameValidator";
import checkEmailDomain from "../validators/emailDomainValidator";
import { formatZodErrors } from "../utils/responseBuilder";
import { validateDynamicForm } from "../utils/dynamicSchemaBuilder";
import { validateWithCustomRules, mergeValidationRules, validateRequiredFields, AdvancedValidationRule } from "../utils/customValidationEngine";
import { analyzeFormFields } from "../utils/fieldTypeDetector";

const router = express.Router();

router.post("/validate", async (req, res) => {
  try {
    // Support both legacy and new validation formats
    const {
      schemaType,
      validationType,
      formData,
      fieldRequirements,
      customRules
    } = req.body;

    // Determine validation mode
    const isLegacyMode = schemaType && !validationType;
    const isDynamicMode = validationType === 'dynamic';
    const isSchemaMode = validationType === 'schema' || isLegacyMode;

    if (!formData) {
      return res.status(400).json({
        success: false,
        error: "formData is required"
      });
    }

    let validated: any;
    let errors: { path: string[]; message: string }[] = [];

    if (isSchemaMode) {
      // Legacy schema-based validation
      const actualSchemaType = schemaType || req.body.schemaType;
      const schema = schemas[actualSchemaType as keyof typeof schemas];

      if (!schema) {
        return res.status(400).json({
          success: false,
          error: "Invalid schema type. Use 'signup' or switch to dynamic validation."
        });
      }

      // Parse with existing schema
      validated = schema.parse(formData);

      // Apply legacy custom validations for signup
      if (actualSchemaType === "signup") {
        const passErr = validatePassword(formData.password, formData.firstname, formData.lastname);
        if (passErr) errors.push({ path: ["password"], message: passErr });

        const [username, domain] = formData.email.split("@");
        if (isSuspiciousEmailUsername(username)) {
          errors.push({
            path: ["email"],
            message: "Email username looks suspicious.",
          });
        }

        if (domain) {
          const domainErr = await checkEmailDomain(domain);
          if (domainErr) errors.push({ path: ["email"], message: domainErr });
        }
      }
    } else if (isDynamicMode) {
      // New dynamic validation

      // First, validate required fields
      const requiredFieldErrors = validateRequiredFields(formData, fieldRequirements);
      errors.push(...requiredFieldErrors);

      // If no required field errors, proceed with dynamic validation
      if (requiredFieldErrors.length === 0) {
        const dynamicResult = validateDynamicForm(formData, fieldRequirements, customRules);

        if (dynamicResult.success) {
          validated = dynamicResult.data;
        } else {
          errors.push(...formatZodErrors(dynamicResult.error));
        }
      }

      // Apply advanced custom rules if provided
      if (customRules && Object.keys(customRules).length > 0) {
        const mergedRules = mergeValidationRules(fieldRequirements, customRules) as Record<string, AdvancedValidationRule>;
        const customErrors = validateWithCustomRules(formData, mergedRules);
        errors.push(...customErrors);
      }

      // Apply special validations for detected field types
      const fieldTypes = analyzeFormFields(formData);

      // Password validation if password field detected
      const passwordFields = Object.keys(fieldTypes).filter(field =>
        fieldTypes[field] === 'password' && formData[field]
      );

      for (const passwordField of passwordFields) {
        // Find name fields for password validation
        const firstNameField = Object.keys(formData).find(field =>
          fieldTypes[field] === 'firstName' || field.toLowerCase().includes('first')
        );
        const lastNameField = Object.keys(formData).find(field =>
          fieldTypes[field] === 'lastName' || field.toLowerCase().includes('last')
        );

        if (firstNameField && lastNameField) {
          const passErr = validatePassword(
            formData[passwordField],
            formData[firstNameField],
            formData[lastNameField]
          );
          if (passErr) {
            errors.push({ path: [passwordField], message: passErr });
          }
        }
      }

      // Email validation for detected email fields
      const emailFields = Object.keys(fieldTypes).filter(field =>
        fieldTypes[field] === 'email' && formData[field]
      );

      for (const emailField of emailFields) {
        const emailValue = formData[emailField];
        if (emailValue && typeof emailValue === 'string') {
          const [username, domain] = emailValue.split("@");

          if (username && isSuspiciousEmailUsername(username)) {
            errors.push({
              path: [emailField],
              message: "Email username looks suspicious.",
            });
          }

          if (domain) {
            const domainErr = await checkEmailDomain(domain);
            if (domainErr) {
              errors.push({ path: [emailField], message: domainErr });
            }
          }
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid validationType. Use 'schema' or 'dynamic'."
      });
    }

    // Return results
    if (errors.length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    // Include field analysis in response for dynamic mode
    const response: any = { success: true, data: validated };
    if (isDynamicMode) {
      response.fieldAnalysis = analyzeFormFields(formData);
    }

    res.json(response);

  } catch (err) {
    const errors = formatZodErrors(err);
    res.status(422).json({ success: false, errors });
  }
});

export default router;
