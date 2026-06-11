import { z } from "zod";

export const deleteAccountOutputSchema = z.object({
  success: z.boolean(),
});

export type DeleteAccountOutput = z.infer<typeof deleteAccountOutputSchema>;
