import { z } from "../deps.ts";
import { IBANSchema } from "../spec/schemas.ts";

export const DebtorSchema = z.object({
  name: z.string().max(70),
  iban: IBANSchema,
  ccy: z.string().length(3),
  bic: z.string().refine((val) => val.length === 8 || val.length === 11),
});

export const CreditorSchema = z.object({
  firstName: z.string().max(70),
  lastName: z.string().max(70),
  iban: IBANSchema,
  bic: z.string().refine((val) => val.length === 8 || val.length === 11)
    .optional(),
  streetName: z.string().max(70).optional(),
  buildingNumber: z.string().max(16).optional(),
  postCode: z.string().max(16).optional(),
  townName: z.string().max(35).optional(),
  countryCode: z.string().length(2).optional(),
});

export const TransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  creditor: CreditorSchema,
  purpose: z.string().max(35),
});
