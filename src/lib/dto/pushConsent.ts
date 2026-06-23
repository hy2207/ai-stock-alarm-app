import { z } from "zod";

export const pushConsentInputSchema = z.object({
  consent: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export type PushConsentInput = z.infer<typeof pushConsentInputSchema>;
