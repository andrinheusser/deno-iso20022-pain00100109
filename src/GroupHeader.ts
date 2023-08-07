import { z } from "../deps.ts";
import { GroupHeader85Schema } from "./../spec/schemas.ts";

export class GroupHeader {
  grpHdr: z.infer<typeof GroupHeader85Schema>;

  constructor(initiatingPartyName: string) {
    const MsgId = crypto.randomUUID().replace(/-/g, "");

    this.grpHdr = {
      MsgId,
      CreDtTm: new Date().toISOString(),
      NbOfTxs: 0,
      CtrlSum: 0,
      InitgPty: {
        Nm: initiatingPartyName,
      },
    };
  }

  updateControls(
    { totalSum, totalTransactions }: {
      totalSum: number;
      totalTransactions: number;
    },
  ) {
    this.grpHdr.NbOfTxs = totalTransactions;
    this.grpHdr.CtrlSum = totalSum;
  }
}
