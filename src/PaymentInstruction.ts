import { validate } from "https://deno.land/x/openiban@1.0.0/src/index.ts";
import { z } from "../deps.ts";
import {
  Pain00100109Schema,
  PaymentInstruction30Schema,
} from "../spec/schemas.ts";
import { GroupHeader } from "./GroupHeader.ts";
import { DebtorSchema, TransactionSchema } from "./schemas.ts";
import { stringify } from "https://deno.land/x/xml@2.1.1/stringify.ts";

export interface PaymentInstructionOptions {
  batchBooking: boolean;
  executionDate: Date;
  paymentMethod: "CHK" | "TRF" | "TRA";
}

const paymentInstructionDefaults: PaymentInstructionOptions = {
  batchBooking: false,
  executionDate: new Date(),
  paymentMethod: "TRF",
};

export class PaymentInstruction {
  groupHeader: GroupHeader;
  instruction: z.infer<typeof PaymentInstruction30Schema>;

  constructor(
    debtor: z.infer<typeof DebtorSchema>,
    options: PaymentInstructionOptions = paymentInstructionDefaults,
    initiatingPartyName?: string,
  ) {
    const validDebtor = DebtorSchema.parse(debtor);
    this.groupHeader = new GroupHeader(initiatingPartyName ?? validDebtor.name);

    this.instruction = {
      PmtInfId: crypto.randomUUID().replace(/-/g, ""),
      PmtMtd: "TRF",
      BtchBookg: options.batchBooking,
      ReqdExctnDt: { Dt: options.executionDate.toISOString().split("T")[0] },
      Dbtr: {
        Nm: validDebtor.name,
      },
      DbtrAcct: {
        Id: {
          IBAN: validDebtor.iban,
        },
      },
      DbtrAgt: {
        FinInstnId: {
          BICFI: validDebtor.bic,
        },
      },
      CdtTrfTxInf: [],
    };
  }

  async addTransaction(
    transaction: z.infer<typeof TransactionSchema>,
  ): Promise<string> {
    const transactionId = crypto.randomUUID().replace(/-/g, "");

    let bic = transaction.creditor.bic;
    if (!bic) {
      try {
        const ibanResult = await validate(transaction.creditor.iban, {
          getBIC: true,
          validateBankCode: true,
        });

        if (!ibanResult.valid || !ibanResult.bankData) {
          throw new Error("Invalid IBAN");
        }

        if (!ibanResult.bankData.bic) {
          throw new Error("BIC not found");
        }
        bic = ibanResult.bankData.bic;
      } catch (e) {
        throw new Error("Invalid IBAN: " + transaction.creditor.iban);
      }
    }

    this.instruction.CdtTrfTxInf.push({
      PmtId: {
        InstrId: transactionId,
        EndToEndId: transactionId,
      },
      Amt: {
        InstdAmt: {
          "#text": transaction.amount,
          "@Ccy": transaction.currency,
        },
      },
      CdtrAgt: {
        FinInstnId: {
          BICFI: bic,
        },
      },
      Cdtr: {
        Nm:
          `${transaction.creditor.firstName} ${transaction.creditor.lastName}`,
      },
      CdtrAcct: {
        Id: {
          IBAN: transaction.creditor.iban,
        },
      },
      RmtInf: {
        Ustrd: [transaction.purpose],
      },
    });

    return transactionId;
  }

  removeTransaction(transactionId: string) {
    this.instruction.CdtTrfTxInf = this.instruction.CdtTrfTxInf.filter(
      (transaction) => transaction.PmtId.InstrId !== transactionId,
    );
  }

  #updateControls() {
    const controls = this.instruction.CdtTrfTxInf.reduce(
      (control, transaction) => {
        if (transaction.Amt.EqvtAmt) {
          control.totalSum += transaction.Amt.EqvtAmt.Amt["#text"];
        } else if (transaction.Amt.InstdAmt) {
          control.totalSum += transaction.Amt.InstdAmt["#text"];
        }
        control.totalTransactions += 1;

        return control;
      },
      {
        totalSum: 0,
        totalTransactions: 0,
      },
    );

    this.groupHeader.updateControls(controls);
  }

  toXml(): string {
    this.#updateControls();

    const data: z.infer<typeof Pain00100109Schema> = Pain00100109Schema.parse({
      Document: {
        "@xmlns": "urn:iso:std:iso:20022:tech:xsd:pain.001.001.09",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:schemaLocation":
          "urn:iso:std:iso:20022:tech:xsd:pain.001.001.09 pain.001.001.09.xsd",
        CstmrCdtTrfInitn: {
          GrpHdr: this.groupHeader.grpHdr,
          PmtInf: [
            this.instruction,
          ],
        },
      },
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n${stringify(data)}`;
  }
}
