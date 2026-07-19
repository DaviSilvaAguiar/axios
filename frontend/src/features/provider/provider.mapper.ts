import { submissionListSchema, type SubmissionList } from "./provider.types";

export function mapSubmissionList(raw: unknown): SubmissionList {
  return submissionListSchema.parse(raw);
}
