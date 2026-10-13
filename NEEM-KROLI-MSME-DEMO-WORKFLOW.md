# Neem Kroli MSME Demo Case — End-to-End Workflow

## Important demo boundary

This is a browser-local demonstration record. The CRM, LOS, decisioning, operations, LMS, and servicing entries described below are saved in the browser's local storage for the `http://127.0.0.1:4173` origin. They are not evidence of an actual customer transaction and are not shared automatically with another browser profile, device, hostname, or port.

All verification, visit, credit, approval, acceptance, signature, payment, disbursement, and servicing details marked **Synthetic Demo Only** are illustrative placeholders. No real SMS OTP, KYC or bureau check, site visit, customer signature, payment, funds transfer, or official accounting voucher was completed.

## Case snapshot

| Item | Demo record |
|---|---|
| Customer / business | Neem Kroli Enterprises |
| CRM lead | `CRM-260104-009` |
| LOS application | `SKF-MS-9732232` |
| Product | MSME |
| Requested amount | ₹25,00,000 |
| Final workflow status | Active Loan |
| Deal ID | `SKF-DEAL-2026-08117` |
| LMS account | `LAN-SKF-MS-9732232` |
| LMS schedule | 48 installments |
| Official GL voucher | None |

## Stage-by-stage workflow

| # | Stage and responsible role | What is entered or done | Recorded demo outcome |
|---|---|---|---|
| 1 | Lead Capture — BSO / sourcing user | Captures the Neem Kroli Enterprises lead, source, requested amount, contact and consent details in CRM. | Lead `CRM-260104-009`; source DSA; owner shown as Neha Jain; requested amount ₹25,00,000. Consent is recorded as given and the OTP is locally verified. |
| 2 | CRM handoff — BSO | Runs the local consent/OTP and duplicate checks, then sends an eligible lead into LOS. | Dedupe result: No Match. OTP is a local demo flow, not an SMS. No live identity or KYC service was called. |
| 3 | LOS application and PD — BSO / field role | Completes the MSME LOS form, supporting document steps, and PD before submitting the completed LOS application. | LOS case `SKF-MS-9732232`; requested amount ₹25,00,000. Synthetic PD record `PD-SKFMS9732232-001`; no real visit, GPS reading, customer photo, or verification occurred. |
| 4 | IMD & BSA verification — BDM | After LOS submission, reviews the IMD reference/amount and BSA information, then verifies the demo transaction. This is a required gate before Credit Review. | Status Verified using local simulator reference `SIM-IMD-FMS9732232`; ₹1,500 illustrative IMD ledger event. No payment was made or received. |
| 5 | Credit Review and bureau cross-check — Credit team | Starts credit review only after BDM verification; reviews illustrative bureau information and records the credit outcome. | Illustrative bureau score 742. This is not a bureau pull or a real credit decision. |
| 6 | RCU / fraud review — RCU Analyst | Records the demo RCU outcome and flags. | Clear; 0 flags; illustrative risk score 12. Synthetic only; no investigation or fraud check occurred. |
| 7 | Deviation review — ACM / approval role | Records the workflow deviation decision for the case. | Deviation status shown as Approved in both the application and its workflow deviation row. This is a simulated approval, not delegated real-world authority. |
| 8 | Technical and Legal — respective verifier roles | Completes the technical and legal review stages that would normally rely on site, property, and title evidence. | Both shown as Completed using synthetic placeholders. No actual inspection, valuation, title search, or legal opinion was obtained. |
| 9 | Underwriting — Underwriter | Records the illustrative underwriting result using the demo case data. | Approved, synthetic only. It is not a credit decision or offer to the customer. |
| 10 | DO checklist — Disbursement Officer | Reviews the pre-disbursement checklist, including identity/KYC, sanction conditions, reports, eSign, bank/IFSC, mandate, invoice/payment proof, security documents, and customer confirmation. | All 10 checklist items were marked complete with synthetic-only remarks. No underlying original documents or confirmations were verified. |
| 11 | Sanction and acceptance — Credit Head | Records an illustrative sanction and demo acceptance. | Version 1 records ₹23,00,000 at 17% for 48 months, with 30-day validity. The amount is below the ₹25,00,000 request. Neither sanction nor acceptance is real. |
| 12 | eSign checklist — Disbursement Officer | Marks the eSign workflow checklist items before the operations handoff. | Checklist shown as Completed. No electronic or wet customer signature occurred. |
| 13 | Disbursement — Central Operations | Runs the simulated disbursement action and creates the deal record. | Deal `SKF-DEAL-2026-08117`; status shown as Disbursed in the demo. The action explicitly moved no funds. |
| 14 | LMS account and schedule — Central Operations / LMS | Creates the servicing account and installment schedule from the illustrative facility terms. | Account `LAN-SKF-MS-9732232`; 48 installments. First installment displayed as ₹66,367 due 5 Nov 2026, comprising ₹33,784 principal and ₹32,583 interest. This is a generated schedule, not a collection obligation. |
| 15 | Servicing subledger — Accountant | Reviews the local demo servicing entries in the General Ledger area. | Four balanced browser-local entries; total debit ₹23,01,500 and total credit ₹23,01,500. This demo subledger is separate from official accounting. |
| 16 | Official General Ledger — Accounts & Finance | Would normally review/post authorized accounting vouchers and reconcile the official books. | No official voucher was created or posted. At the last check, the official GL dashboard showed zero accounting years, periods, groups, ledgers, pending vouchers, and posted vouchers; trial balance was ₹0 debit / ₹0 credit. |

## Role handoffs for a presentation

1. **BSO / sourcing:** capture the lead and pass the eligible demo lead to LOS.
2. **Credit and case-processing roles:** review the case, record the synthetic PD and illustrative bureau inputs, then route RCU, Technical, Legal, and Underwriting work.
3. **ACM / approval role and Credit Head:** record the simulated deviation and sanction decisions.
4. **Disbursement Officer:** complete the demo checklist and eSign checklist.
5. **Central Operations:** run the no-funds-moved disbursement simulation and create the LMS demo account/schedule.
6. **Accountant / Accounts & Finance:** inspect the local servicing subledger. Finance Manager and CFO roles are available in the role selector, but the case did not create an official GL voucher or test an approval/posting by those roles. CFO reports to CEO in the configured role hierarchy.

The workspace selector keeps **Origination**, **Credit & Decisioning**, **Loan Operations / LMS**, and **General Ledger** as separate groups. The demo currently has the relevant modules selected under their respective groups; General Ledger remains separate from Loan Operations / LMS.

## Important record limitations

- **Sanction version 1 persistence:** the accepted demo version persisted amount, rate, tenure, validity, and the demo acceptance marker. The form had displayed a 2% processing fee, E-Nach, and CP/CS terms, but those values were not persisted for that already-accepted version: the stored fee is 0 and the repayment/CP/CS fields are blank. A later code fix saves those fields for future records, but version 1 was not revised. Do not present those displayed defaults as agreed or persisted terms.
- **CRM date discrepancy:** the lead's stored creation date displays 4 Oct 2026, while the later workflow activity and LOS case date show 12 Oct 2026.
- **No real-world evidence:** synthetic labels do not substitute for customer consent evidence, KYC, bureau data, inspection, legal diligence, sanction authorization, acceptance, eSign, payment, or disbursement.
- **Corrected handoff order:** after LOS submission, the application must enter BDM's IMD & BSA verification queue; it can enter Credit Review only after that verification. Pre-sanction cases found later in the workflow without verified IMD can be returned to BDM, with downstream workflow statuses reset to pending and prior case data/audit retained. Sanctioned or disbursed cases are not eligible for this recovery action.
- **Local persistence only:** the demo is visible only in the browser profile and origin where it was recorded. The relevant browser-local records include `namdev-demo-full-state`, `namdev-connected-lifecycle-v1`, `namdev-audit-trail`, and `namdev-pd-records-v3`.
- **No official GL posting:** the four balanced local servicing entries are not accounting vouchers, do not affect the official trial balance, and must not be described as a posted journal.

## Suggested presentation run-through

Open the application on the same browser profile and origin (`http://127.0.0.1:4173`), then show the Neem Kroli lead/application, the synthetic decision and operations milestones, the LMS account and generated schedule, and finally the General Ledger screen. Call out the **Synthetic Demo Only** labels as each simulated milestone is shown. Close on the official GL dashboard to make clear that the local servicing subledger is illustrative and no official voucher or funds movement occurred.
