import { z } from "zod";

export const submissionSchema = z.object({
  id: z.number(),
  type: z.enum(["expense_report", "reimbursement"]),
  title: z.string(),
  total_amount: z.string(),
  status: z.number(),
  created_at: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;

export const submissionListSchema = z.object({
  data: z.array(submissionSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
});
export type SubmissionList = z.infer<typeof submissionListSchema>;

export type SubmissionType = "expense_report" | "reimbursement";
export type SubmissionFilter = "all" | SubmissionType;
