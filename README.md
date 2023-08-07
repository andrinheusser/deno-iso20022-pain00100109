# ISO 20022 pain.001.001.09 messages

Deno library to create pain001 messages.

## Goals

- Simple API
- Create transactions minimal information
- Generate messages valid within swiss financial institutions

## Usage

```typescript
const instruction = new PaymentInstruction({
  name: "John Doe",
  iban: "CH0204835000626882001",
  ccy: "CHF",
  bic: "POFICHBEXXX",
}, {
  executionDate: new Date("2021-01-01"),
  batchBooking: true,
  paymentMethod: "TRF",
});

await instruction.addTransaction({
  amount: 100,
  currency: "CHF",
  creditor: {
    firstName: "Jane",
    lastName: "Doe",
    iban: "CH0209000000100013997",
  },
  purpose: "Test",
});

const xml = instruction.toXml();
```

### Handling missing BICs

When a transaction doesn't specify a BIC, openiban.com is used to look up the BIC corresponding to the IBAN.