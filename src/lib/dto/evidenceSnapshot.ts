import { z } from "zod";

/** Zod schema for validating EvidenceSnapshot create payloads. */
export const evidenceSnapshotCreateSchema = z.object({
  recId: z.string().cuid(),
  newsSignalScore: z.number().min(0).max(100).nullable().optional(),
  volumeSignalScore: z.number().min(0).max(100).nullable().optional(),
  communitySignalScore: z.number().min(0).max(100).nullable().optional(),
  patternTag: z.string().min(1).max(50).nullable().optional(),
});

export type EvidenceSnapshotCreateInput = z.infer<
  typeof evidenceSnapshotCreateSchema
>;

/** Zod schema matching the full Prisma EvidenceSnapshot model. */
export const evidenceSnapshotSchema = z.object({
  id: z.string().cuid(),
  recId: z.string().cuid(),
  newsSignalScore: z.number().nullable(),
  volumeSignalScore: z.number().nullable(),
  communitySignalScore: z.number().nullable(),
  patternTag: z.string().nullable(),
  createdAt: z.date(),
});

export type EvidenceSnapshot = z.infer<typeof evidenceSnapshotSchema>;
