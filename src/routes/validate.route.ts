import express from "express";
import { schemas } from "../schemas";
import validatePassword from "../validators/passwordValidator";
import isSuspiciousEmailUsername from "../validators/emailUsernameValidator";
import checkEmailDomain from "../validators/emailDomainValidator";
import { formatZodErrors } from "../utils/responseBuilder";

const router = express.Router();

router.post("/validate", async (req, res) => {
  const { schemaType, formData } = req.body;
  const schema = schemas[schemaType as keyof typeof schemas];
  if (!schema) return res.status(400).json({ error: "Invalid schema type." });

  try {
    const validated = schema.parse(formData);
    const errors: { path: string[]; message: string }[] = [];

    if (schemaType === "signup") {
      const passErr = validatePassword(formData.password, formData.name);
      if (passErr) errors.push({ path: ["password"], message: passErr });

      const [username, domain] = formData.email.split("@");
      if (isSuspiciousEmailUsername(username))
        errors.push({
          path: ["email"],
          message: "Email username looks suspicious.",
        });

      if (domain) {
        const domainErr = await checkEmailDomain(domain);
        if (domainErr) errors.push({ path: ["email"], message: domainErr });
      }
    }

    if (errors.length > 0)
      return res.status(422).json({ success: false, errors });
    return res.json({ success: true, data: validated });
  } catch (err) {
    return res
      .status(422)
      .json({ success: false, errors: formatZodErrors(err) });
  }
});

export default router;
