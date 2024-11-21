import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';
export const createFXQLSchema = z
  .object({
    // FXQL: z.string(),
    FXQL: z
      .string()
      .regex(
        /^(([A-Z]{3,3})-([A-Z]{3,3})\s{\s*\\n\s*BUY\s+(\d*\.?\d+)\s*\\n\s*SELL\s+(\d*\.?\d+)\s*\\n\s*CAP\s+(\d+)\s*\\n\s*}\s*(\\n)*)*\s*$/,
      ),
  })
  .required();

export type CreateFXQLDto = z.infer<typeof createFXQLSchema>;
const CreateFXQLZ = extendApi(createFXQLSchema, {
  examples: [
    `{
    "FXQL": "LZZ-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}"
  }`,
  ],
});
export class CreateFXQLDTO extends createZodDto(CreateFXQLZ) {}
