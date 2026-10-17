import { z } from 'zod';

export const predictFormSchema = z
  .object({
    mode: z.enum(['early', 'midterm']),
    subject: z.enum(['math', 'portuguese']),
    studytime: z.coerce.number().min(1, 'Study time must be between 1 and 4').max(4),
    failures: z.coerce.number().min(0, 'Failures must be between 0 and 4').max(4),
    absences: z.coerce.number().min(0, 'Absences must be 0 or greater').max(93),
    higher: z.coerce.number().min(0).max(1),
    schoolsup: z.coerce.number().min(0).max(1),
    G1: z.coerce.number().min(0).max(20).optional(),
    G2: z.coerce.number().min(0).max(20).optional(),
    school: z.string().default('GP'),
    sex: z.string().default('F'),
    age: z.coerce.number().min(15).max(22).default(17),
    address: z.string().default('U'),
    famsize: z.string().default('GT3'),
    Pstatus: z.string().default('T'),
    Medu: z.coerce.number().min(0).max(4).default(2),
    Fedu: z.coerce.number().min(0).max(4).default(2),
    Mjob: z.string().default('other'),
    Fjob: z.string().default('other'),
    reason: z.string().default('course'),
    guardian: z.string().default('mother'),
    traveltime: z.coerce.number().min(1).max(4).default(1),
    famsup: z.coerce.number().min(0).max(1).default(1),
    paid: z.coerce.number().min(0).max(1).default(0),
    activities: z.coerce.number().min(0).max(1).default(1),
    nursery: z.coerce.number().min(0).max(1).default(1),
    internet: z.coerce.number().min(0).max(1).default(1),
    romantic: z.coerce.number().min(0).max(1).default(0),
    famrel: z.coerce.number().min(1).max(5).default(4),
    freetime: z.coerce.number().min(1).max(5).default(3),
    goout: z.coerce.number().min(1).max(5).default(3),
    Dalc: z.coerce.number().min(1).max(5).default(1),
    Walc: z.coerce.number().min(1).max(5).default(1),
    health: z.coerce.number().min(1).max(5).default(3),
    label: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.mode === 'midterm') {
        return data.G1 !== undefined && !isNaN(data.G1) && data.G2 !== undefined && !isNaN(data.G2);
      }
      return true;
    },
    {
      message: 'Both Term 1 (G1) and Term 2 (G2) grades are required in Mid-Term mode.',
      path: ['G1'],
    }
  );

export type PredictFormSchemaType = z.infer<typeof predictFormSchema>;
