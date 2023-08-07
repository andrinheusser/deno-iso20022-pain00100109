import { z } from "../deps.ts";

function isISODate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isISODatetime(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(value);
}

function isIBAN(value: string): boolean {
    return /^[A-Z]{2}\d{2}\s?([0-9a-zA-Z]{4}\s?){4}[0-9a-zA-Z]{2}$/.test(value);
}

const ISODateSchema = z.string().refine((value) => isISODate(value), "Invalid ISO date format");
const ISODatetimeSchema = z.string().refine((value) => isISODatetime(value), "Invalid ISO datetime format");
const IBANSchema = z.string().refine((value) => isIBAN(value), "Invalid IBAN format");

const DateAndDateTime2ChoiceSchema = z.object({
    Dt: ISODateSchema.describe("Date expressed as a calendar date."),
    DtTm: ISODatetimeSchema.describe("Date and time together expressed in ISO 8601 format."),
}).partial().superRefine((val, ctx) => {
    if (!val.Dt && !val.DtTm) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either Dt or DtTm must be present",
            path: [],
        });
    }
}).describe("Choice between a date or a date and time format.");


const CurrencySchema = z.string().min(3).max(3)

const ChargeBearerType1CodeSchema = z.enum(["DEBT", "CRED", "SHAR", "SLEV"])

const Instruction3Code = z.enum(["CHQB", "HOLD", "PHOB", "TELB"])

const Contact4Schema = z.object({
    NmPrfx: z.enum(["DOCT", "MADM", "MISS", "MIST", "MIKS"]).optional().describe("Title of the person."),
    Nm: z.string().max(40).optional().describe("Name by which a party is known and which is usually used to identify that party."),
    PhneNb: z.string().max(50).optional().describe("Collection of information that identifies a phone number."),
    MobNb: z.string().max(50).optional().describe("Collection of information that identifies a mobile phone number."),
    FaxNb: z.string().max(50).optional().describe("Collection of information that identifies a FAX number."),
    EmailAdr: z.string().email().optional().describe("Address for electronic mail (e-mail)."),
    EmailPurp: z.string().max(35).optional().describe("Purpose for which an email address may be used."),
    JobTitl: z.string().max(35).optional().describe("Title of the function."),
    Rspnsblty: z.string().max(35).optional().describe("Role of a person in an organisation."),
    Dept: z.string().max(70).optional().describe("Identification of a division of a large organisation or building."),
    Othr: z.array(z.object({
        ChanlTp: z.string().max(4).describe("Method used to contact the financial institution's contact for the specific tax region."),
        Id: z.string().max(128).optional().describe("Communication value such as phone number or email address."),
    })).optional().describe("Contact details in another form."),
    PrefrdMtd: z.enum(["LETT", "MAIL", "PHON", "FAXX", "CELL"]).optional().describe("Preferred method used to reach the contact."),
});

const PostalAddress24Schema = z.object({
    addressType: z.object({
        code: z.literal("ADDR"),
    }).describe("Identifies the nature of the postal address"),
    department: z.string().max(70).optional().describe("Identification of a division of a large organisation or building."),
    subDepartment: z.string().max(70).optional().describe("Identification of a sub-division of a large organisation or building."),
    streetName: z.string().max(70).optional().describe("Name of a street or thoroughfare."),
    buildingNumber: z.string().max(16).optional().describe("Number that identifies the position of a building on a street."),
    buildingName: z.string().max(35).optional().describe("Name of the building or house."),
    floor: z.string().max(70).optional().describe("Floor or storey within a building."),
    postBox: z.string().max(16).optional().describe("Numbered box in a post office, assigned to a person or organisation, where letters are kept until called for."),
    room: z.string().max(70).optional().describe("Building room number."),
    postCode: z.string().max(16).optional().describe("Identifier consisting of a group of letters and/or numbers that is added to a postal address to assist the sorting of mail."),
    townName: z.string().max(35).optional().describe("Name of a built-up area, with defined boundaries, and a local government."),
    townLocationName: z.string().max(35).optional().describe("Specific location name within the town."),
    districtName: z.string().max(35).optional().describe("Identifies a subdivision within a country sub-division."),
    countrySubDivision: z.string().max(35).optional().describe("Identifies a subdivision of a country such as state, region, county."),
    country: z.string().min(2).max(2).optional().describe("Nation with its own government."),
    addressLine: z.array(z.string()).max(7).optional().describe("Information that locates and identifies a specific address, as defined by postal services, presented in free format text."),
});

const PartyIdentification135Schema = z.object({
    Nm: z.string().max(140).describe("Name by which a party is known and which is usually used to identify that party."),
    PstlAdr: PostalAddress24Schema.optional().describe("Information that locates and identifies a specific address, as defined by postal services."),
    // TODO: Id
    //Id: z.object()
    CtryOfRes: z.string().min(2).max(2).optional().describe("Country in which a person resides (the place of a person's home). In the case of a company, it is the country from which the affairs of that company are directed."),
    CtctDtls: Contact4Schema.optional()
})

const CashAccount38Schema = z.object({
    Id: z.object({
        IBAN: IBANSchema.describe("International Bank Account Number (IBAN) - identifier used internationally by financial institutions to uniquely identify the account of a customer."),
    }).describe("Unique and unambiguous identification of the account between the account owner and the account servicer."),
    Ccy: z.string().min(3).max(3).optional().describe("Identification of the currency in which the account is held"),
    Nm: z.string().max(70).optional().describe("Name of the account, as assigned by the account servicing institution, in agreement with the account owner in order to provide an additional means of identification of the account."),
    // TODO: Proxy
    // Prxy: z.object().optional().describe("Proxy details of the account."),
})

const ClearingSystemMemberIdentification2Schema = z.object({
    ClrSysId: z.object({
        Cd: z.string().min(1).max(5).describe("Specifies the clearing system identification code, as published in an external clearing system identification code list"),
        Prtry: z.string().max(35).optional().describe("Identification code for a clearing system, that has not yet been identified in the list of clearing systems."),
    }).partial().superRefine((val, ctx) => {
        if (!val.Cd && !val.Prtry) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Either Cd or Prtry must be present",
                path: ["ClrSysId"],
            })
        }
    }).describe(" Specification of a pre-agreed offering between clearing agents or the channel through which the payment instruction is processed."),
    MmbId: z.string().max(35).describe("Identification of a member of a clearing system.")
})

const FinancialInstitutionIdentification18Schema = z.object({
    BICFI: z.string().refine((s) => s.length === 8 || s.length === 11).optional().describe("Code allocated to a financial institution by the ISO 9362 Registration Authority as described in ISO 9362 Banking - Banking telecommunication messages - Business identifier code (BIC)."),
    ClrSysMmbId: ClearingSystemMemberIdentification2Schema.optional().describe("Information used to identify a member within a clearing system."),
    // TODO: LEI restrictions
    LEI: z.string().optional().describe("Legal entity identifier of the financial institution"),
    Nm: z.string().max(140).optional().describe("Name by which an agent is known and which is usually used to identify that agent."),
    PstlAdr: PostalAddress24Schema.optional().describe("Information that locates and identifies a specific address, as defined by postal services."),
    // TODO: Othr
    //Othr: z.object().optional().describe("Unique identification of an agent, as assigned by an institution, using an identification scheme.")
})


const BranchAndFinancialInstitutionIdentification6Schema = z.object({
    FinInstnId: FinancialInstitutionIdentification18Schema.describe(" Unique and unambiguous identification of a financial institution, as assigned under an internationally recognised or proprietary identification scheme."),
    // TODO: BrnchId
    //BrnchId: z.object().optional().describe("Identifies a specific branch of a financial institution.")
})

const PaymentIdentification6Schema = z.object({
    InstrId: z.string().max(35).describe("Unique identification as assigned by an instructing party for an instructed party to unambiguously identify the instruction."),
    EndToEndId: z.string().max(35).describe("Unique identification assigned by the initiating party to unambiguously identify the transaction. This identification is passed on, unchanged, throughout the entire end-to-end chain."),
    UETR: z.string().uuid().optional().describe("Universally unique identifier to provide an end-to-end reference of a payment transaction."),
})

const PaymentTypeInformation29Schema = z.object({
    InstrPrty: z.enum(["HIGH", "NORM"]).optional().describe("Indicator of the urgency or order of importance that the instructing party would like the instructed party to apply to the processing of the instruction."),
    // TODO: SvcLvl
    // TODO: LclInstrm
    SeqTp: z.enum(["FRST", "RCUR", "FNAL", "OOFF", "RPRE"]).optional().describe("Identifies the direct debit sequence, such as first, recurrent, final or one-off."),
    // TODO: CtgyPurp
})

const ActiveOrHistoricCurrencyAndAmountSchema = z.object({
    "@Ccy": z.string().min(3).max(3).describe("Currency in which the amount is expressed. XML Attribute"),
    "#text": z.number().min(0).max(999999999999.99).describe("Amount of money")
})

const AmountType4ChoiceSchema = z.union([
    z.object({
        InstdAmt: ActiveOrHistoricCurrencyAndAmountSchema.describe("Amount of money to be moved between the debtor and creditor, before deduction of charges, expressed in the currency as ordered by the initiating party."),
    }),
    z.object({
        EqvtAmt: z.object({
            Amt: ActiveOrHistoricCurrencyAndAmountSchema.describe("Amount of money to be moved between debtor and creditor, before deduction of charges, expressed in the currency of the debtor's account, and to be moved in a different currency."),
            CcyOfTrf: z.string().min(3).max(3).describe("Specifies the currency of the to be transferred amount, which is different from the currency of the debtor's account.")
        })
    })
])

const Purpose2ChoiceSchema = z.object({
    Cd: z.string().min(1).max(4).describe("Specifies the external purpose code in the format of character string with a maximum length of 4 characters"),
    Prtry: z.string().max(35).describe("Purpose, in a proprietary form.")
}).superRefine((val, ctx) => {
    if (!val.Cd && !val.Prtry) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either Cd or Prtry must be present",
            path: ["Purpose"],
        })
    }
})


const CreditTransferTransaction34Schema = z.object({
    PmtId: PaymentIdentification6Schema.describe("Set of elements used to reference a payment instruction."),
    PmtTpInf: PaymentTypeInformation29Schema.optional().describe("Set of elements used to further specify the type of transaction."),
    Amt: AmountType4ChoiceSchema.describe("Amount of money to be moved between the debtor and creditor, before deduction of charges, expressed in the currency as ordered by the initiating party."),
    XchgRateInf: z.object({
        UnitCcy: CurrencySchema.optional().describe("Currency in which the rate of exchange is expressed in a currency exchange. In the example 1GBP = xxxCUR, the unit currency is GBP"),
        XchgRate: z.number().optional().describe(" The factor used for conversion of an amount from one currency to another. This reflects the price at which one currency was bought with another currency."),
        RateTp: z.enum(["SPOT", "SALE", "AGRD"]).optional().describe("Specifies the type used to complete the currency exchange."),
        CtrctId: z.string().max(35).optional().describe("Unique and unambiguous reference to the foreign exchange contract agreed between the initiating party/creditor and the debtor agent.")
    }).optional().describe("Provides details on the currency exchange rate and contract."),
    ChrgBr: ChargeBearerType1CodeSchema.optional().describe("Specifies which party/parties will bear the charges associated with the processing of the payment transaction"),
    // TODO: ChqInstr
    // ChqInstr: ,
    UltmtDbtr: PartyIdentification135Schema.optional().describe("Ultimate party that owes an amount of money to the (ultimate) creditor."),
    IntrmyAgt1: BranchAndFinancialInstitutionIdentification6Schema.optional().describe("Agent between the debtor's agent and the creditor's agent."),
    IntrmyAgt1Acct: CashAccount38Schema.optional().describe("Unambiguous identification of the account of the intermediary agent 1 at its servicing agent in the payment chain."),
    IntrmyAgt2: BranchAndFinancialInstitutionIdentification6Schema.optional().describe("Agent between the debtor's agent and the creditor's agent."),
    IntrmyAgt2Acct: CashAccount38Schema.optional().describe("Unambiguous identification of the account of the intermediary agent 2 at its servicing agent in the payment chain."),
    IntrmyAgt3: BranchAndFinancialInstitutionIdentification6Schema.optional().describe("Agent between the debtor's agent and the creditor's agent."),
    IntrmyAgt3Acct: CashAccount38Schema.optional().describe("Unambiguous identification of the account of the intermediary agent 3 at its servicing agent in the payment chain."),
    CdtrAgt: BranchAndFinancialInstitutionIdentification6Schema.describe("Financial institution servicing an account for the creditor."),
    CdtrAgtAcct: CashAccount38Schema.optional().describe("Unambiguous identification of the account of the creditor agent at its servicing agent to which a credit entry will be made as a result of the payment transaction"),
    Cdtr: PartyIdentification135Schema.optional().describe("Party to which an amount of money is due."),
    CdtrAcct: CashAccount38Schema.optional().describe("Unambiguous identification of the account of the creditor to which a credit entry will be posted as a result of the payment transaction."),
    UltmtCdtr: PartyIdentification135Schema.optional().describe("Ultimate party to which an amount of money is due."),
    InstrForCdtrAgt: z.object({
        Cd: Instruction3Code.optional().describe("Coded information related to the processing of the payment instruction, provided by the initiating party, and intended for the creditor's agent."),
        InstrInf: z.string().max(140).optional().describe("Further information complementing the coded instruction or instruction to the creditor's agent that is bilaterally agreed or specific to a user community")
    }).array().optional().describe("Further information related to the processing of the payment instruction, provided by the initiating party, and intended for the creditor agent."),
    InstrForDbtrAgt: z.string().max(140).optional().describe("Further information related to the processing of the payment instruction, that may need to be acted upon by the debtor agent, depending on agreement between debtor and the debtor agent."),
    Purp: Purpose2ChoiceSchema.optional().describe("Underlying reason for the payment transaction."),
    // TODO: RgltryRptg
    // RgltryRptg: ,
    // TODO: Tax
    // Tax: ,
    // TODO: RltdRmtInf
    // RltdRmtInf: ,
    // TODO: RmtInf
    // RmtInf: ,
    // TODO: SplmtryData
    // SplmtryData: ,
}).superRefine((val, ctx) => {

    // Intermediary agent 1 account rule
    if (val.IntrmyAgt1 && !val.IntrmyAgt1Acct) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "IntrmyAgt1Acct must be present if IntrmyAgt1 is present",
            path: ["IntrmyAgt1Acct"],
        })
    }
    // Intermediary agent 2 account rule
    if (val.IntrmyAgt2 && !val.IntrmyAgt2Acct) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "IntrmyAgt2Acct must be present if IntrmyAgt2 is present",
            path: ["IntrmyAgt2Acct"],
        })
    }

    // Intermediary agent 2 rule
    if (val.IntrmyAgt2 && !val.IntrmyAgt1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "IntrmyAgt1 must be present if IntrmyAgt2 is present",
            path: ["IntrmyAgt1"],
        })
    }

    // Intermediary agent 3 account rule
    if (val.IntrmyAgt3 && !val.IntrmyAgt3Acct) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "IntrmyAgt3Acct must be present if IntrmyAgt3 is present",
            path: ["IntrmyAgt3Acct"],
        })
    }

    // Intermediary agent 3 rule
    if (val.IntrmyAgt3 && !val.IntrmyAgt2) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "IntrmyAgt2 must be present if IntrmyAgt3 is present",
            path: ["IntrmyAgt2"],
        })
    }

})



const PaymentInstruction30Schema = z.object({
    PmtInfId: z.string().max(35).describe("Unique identification, as assigned by a sending party, to unambiguously identify the payment information group within the message"),
    PmtMtd: z.enum(["CHK", "TRF", "TRA"]).describe("Specifies the means of payment that will be used to move the amount of money."),
    BtchBookg: z.boolean().optional().describe(" Identifies whether a single entry per individual transaction or a batch entry for the sum of the amounts of all transactions within the group of a message is requested."),
    NbOfTxs: z.number().min(1).max(99999999999999).optional().describe("Number of individual transactions contained in the payment information group"),
    CtrlSum: z.number().optional().describe("Total of all individual amounts included in the group, irrespective of currencies"),
    // TODO: PmtTpInf
    //PmtTpInf: z.object().optional(),
    ReqdExctnDt: DateAndDateTime2ChoiceSchema.describe("Date at which the initiating party requests the clearing agent to process the payment"),
    PoolgAdjstmntDt: ISODateSchema.optional().describe("Date used for the correction of the value date of a cash pool movement that has been posted with a different value date"),
    Dbtr: PartyIdentification135Schema.describe("Party that owes an amount of money to the (ultimate) creditor"),
    DbtrAcct: CashAccount38Schema.describe("Unambiguous identification of the account of the debtor to which a debit entry will be made as a result of the transaction."),
    DbtrAgt: BranchAndFinancialInstitutionIdentification6Schema.describe("Financial institution servicing an account for the debtor."),
    DbtrAgtAcct: CashAccount38Schema.optional().describe("Unambiguous identification of the account of the debtor agent at its servicing agent in the payment chain."),
    InstrForDbtrAgt: z.string().max(140).optional().describe("Further information related to the processing of the payment instruction, that may need to be acted upon by the debtor agent, depending on agreement between debtor and the debtor agent."),
    UltmtDbtr: PartyIdentification135Schema.optional().describe("Ultimate party that owes an amount of money to the (ultimate) creditor."),
    ChrgBr: ChargeBearerType1CodeSchema.optional().describe("Specifies which party/parties will bear the charges associated with the processing of the payment transaction."),
    ChrgsAcct: CashAccount38Schema.optional().describe("Account used to process charges associated with a transaction."),
    ChrgsAcctAgt: BranchAndFinancialInstitutionIdentification6Schema.optional().describe("Agent that services the account used to process charges associated with a transaction."),
    CdtTrfTxInf: z.array(CreditTransferTransaction34Schema).min(1)
}).superRefine((val, ctx) => {
    if (val.ChrgBr && val.CdtTrfTxInf) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "chargeBearer and creditTransferTransactionInformation are mutually exclusive",
            path: ["chargeBearer/creaditTransferTransactionInformation"],
        })
    }
    if (val.ChrgsAcctAgt && !val.ChrgsAcct) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "chargesAccountAgent requires chargesAccount",
            path: ["chargesAccountAgent"],
        })
    }
})

const GroupHeader85Schema = z.object({
    MsgId: z.string().max(35).describe("Point to point reference, as assigned by the instructing party, and sent to the next party in the chain to unambiguously identify the message."),
    CreDtTm: ISODatetimeSchema.describe("Date and time at which the message was created."),
    // TODO: Authstn
    // Authstn: ,
    NbOfTxs: z.number().min(1).max(99999999999999).describe("Number of individual transactions contained in the message."),
    CtrlSum: z.number().describe("Total of all individual amounts included in the message, irrespective of currencies."),
    InitgPty: PartyIdentification135Schema.describe("Party that initiates the payment"),
    FwdgAgt: BranchAndFinancialInstitutionIdentification6Schema.optional().describe("Financial institution that receives the instruction from the initiating party and forwards it to the next agent in the payment chain for execution."),
})

export const Pain00100109Schema = z.object({
    Document: z.object({
        CstmrCdtTrfInitn: z.object({
            GrpHdr: GroupHeader85Schema,
            PmtInf: z.array(PaymentInstruction30Schema).min(1),
        }),
        "@xmlns": z.literal("urn:iso:std:iso:20022:tech:xsd:pain.001.001.09"),
        "@xmlns:xsi": z.literal("http://www.w3.org/2001/XMLSchema-instance"),
        "@xsi:schemaLocation": z.literal("urn:iso:std:iso:20022:tech:xsd:pain.001.001.09 spec/pain.001.001.09.xsd"),
    })
})