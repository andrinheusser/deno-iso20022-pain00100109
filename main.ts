import { stringify, z } from "./deps.ts"
import { Pain00100109Schema } from "./src/schemas.ts"


const myPain: z.infer<typeof Pain00100109Schema> = {
    Document: {
        "@xmlns": "urn:iso:std:iso:20022:tech:xsd:pain.001.001.09",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:schemaLocation": "urn:iso:std:iso:20022:tech:xsd:pain.001.001.09 spec/pain.001.001.09.xsd",
        CstmrCdtTrfInitn: {
            GrpHdr: {
                MsgId: "123456789",
                CreDtTm: new Date().toISOString(),
                NbOfTxs: 1,
                CtrlSum: 100.2,
                InitgPty: {
                    Nm: "John Doe",
                }
            },
            PmtInf: [
                {
                    PmtInfId: "123456789",
                    PmtMtd: "TRF",
                    ReqdExctnDt: { Dt: new Date().toISOString().split("T")[0] },
                    Dbtr: {
                        Nm: "John Doe Dbtr",
                    },
                    DbtrAcct: {
                        Id: {
                            IBAN: "CH0209000000100013997",
                        },
                    },
                    DbtrAgt: {
                        FinInstnId: {
                            BICFI: "POFICHBE",
                        },
                    },
                    CdtTrfTxInf: [{
                        PmtId: {
                            InstrId: "123456789",
                            EndToEndId: "123456789",
                        },
                        Amt: {
                            InstdAmt: {
                                "#text": 100.2,
                                "@Ccy": "CHF",
                            }
                        },
                        CdtrAgt: {
                            FinInstnId: {
                                BICFI: "CRESCHZZ80A",
                            },
                        },
                        Cdtr: {
                            Nm: "John Doe Cdtr",
                        },
                        CdtrAcct: {
                            Id: {
                                IBAN: "CH0204835000626882001",
                            },
                        },
                    }]
                }
            ]
        }
    }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` + stringify(myPain)

console.log(xml)
