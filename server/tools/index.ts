import type { ZodType } from "zod";
import { schema as requisitionExtractorSchema } from "./requisition-extractor/schema";
import { schema as candidateResumeExtractorSchema } from "./candidate-resume-extractor/schema";
import { schema as licenseExtractorSchema } from "./license-extractor/schema";
import { schema as certificationExtractorSchema } from "./certification-extractor/schema";

export type ToolConfig = {
  id: string;
  schema: ZodType;
};

export const toolRegistry: Record<string, ToolConfig> = {
  "requisition-extractor": {
    id: "requisition-extractor",
    schema: requisitionExtractorSchema,
  },
  "candidate-resume-extractor": {
    id: "candidate-resume-extractor",
    schema: candidateResumeExtractorSchema,
  },
  "license-extractor": {
    id: "license-extractor",
    schema: licenseExtractorSchema,
  },
  "certification-extractor": {
    id: "certification-extractor",
    schema: certificationExtractorSchema,
  },
};
