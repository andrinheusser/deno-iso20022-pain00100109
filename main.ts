import { stringify, z } from "./deps.ts"
import { Pain00100109Schema } from "./src/schemas.ts"


const myPain: z.infer<typeof Pain00100109Schema> = {
    Document: {
        GrpHdr: {
            MsgId: "123456789",
            InitgPty: {
                Nm: "John Doe",
            }
        },
        PmtInf: [
            {
                PmtInfId: "123456789",
                PmtMtd: "TRF",
                Dbtr: {
                    Nm: "John Doe",
                },
                DbtrAcct: {
                    Id: {
                        IBAN: "DE123456789",
                    },
                },
                DbtrAgt: {
                    FinInstnId: {
                        BICFI: "GENODEF1JEV",
                    },
                },
                CdtTrfTxInf: [{
                    PmtId: {
                        EndToEndId: "123456789",
                    },
                    Amt: {
                        InstdAmt: {
                            amt: 100.2,
                            "@Ccy": "CHF",
                        }
                    },
                    CdtrAgt: {
                        FinInstnId: {
                            BICFI: "GENODEF1JEV",
                        },
                    },
                    CdtrAcct: {
                        Id: {
                            IBAN: "DE123456789",
                        },
                    },
                    Cdtr: {
                        Nm: "John Doe",
                    },
                }]
            }
        ]
    }
}

const xml = stringify(myPain)
console.log(xml)
