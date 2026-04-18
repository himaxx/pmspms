// ─── Sheet Names ────────────────────────────────────────────────────────────
export const SHEET_NAMES = {
  FFMS:   'FFMS',
  STEP1: 'New Requirement',
  STEP2: 'Production Approval',
  STEP3: 'In house Cutting',
  STEP4: 'Naame',
  STEP5: 'Finished Maal Jama',
  STEP6: 'Settle',
};

// ─── People Per Step ─────────────────────────────────────────────────────────
export const STEP_PEOPLE = {
  1: ['Naresh', 'Bunty', 'Ankit', 'Sourabh', 'Manohar', 'Sanjay', 'Ashwin'],
  2: ['NR', 'KR', 'KPR'],
  3: ['Vinod', 'Rahul'],
  4: [
    "Mukati Ji",
    "Test",
    "Sitaram Ji",
    "Kushal Parmar Ji",
    "Harish Bakadiya Ji",
    "Sanjay Verma Ji",
    "Ajay Majumdar Ji",
    "Sunil Singhnath Ji",
    "Somraj Singhnath Ji",
    "Vishal Pancholi Ji",
    "Jitendre Verma Ji",
    "Murli Namdev Ji",
    "Amzad Khan Ji",
    "Rajesh Khatri Ji",
    "Said Khan Ji",
    "Anish Maatshab Ji",
    "Anil Pal Ji",
    "Bharat Namdev Ji",
    "Shakil Shikh Ji",
    "Abdul Kadir Ji",
    "Anil Goswami Ji",
    "Nilesh Thakur Ji",
    "Anil Pradhan Ji",
    "Dilip Sisodiya Ji",
    "Jitendre Chorey Ji",
    "Anil Pawar Ji"
  ],
  5: ['Ashok'],
  6: [], // free text — anyone
};

// ─── Step Labels ─────────────────────────────────────────────────────────────
export const STEP_LABELS = {
  1: 'Yeh Maal Banwana Hai',
  2: 'Fabric Ready — Production Approval',
  3: 'Inhouse Cutting',
  4: 'Naame — Goods on Production',
  5: 'Jama',
  6: 'Settle',
};

// ─── Item Groups ─────────────────────────────────────────────────────────────
export const ITEM_GROUPS = [
  'Full Bottom',
  'Capri',
  'Shorts',
  'Skirts',
  'Tops/Tshirts',
  'Aline/Frock/Long Tops',
  'Sets',
  'Boys',
];

// ─── FMS Column Index Map ─────────────────────────────────────────────────────
export const FMS_COLUMNS = {
  // Core job info
  jobNo:              0,
  date:               1,
  progBy:             2,
  item:               3,
  size:               4,
  qty:                5,
  reason:             6,
  specialInstruction: 7,
  itemGroup:          8,

  // Step 2 — Production Approval
  s2Planned:          9,
  s2Actual:           10,
  s2YesNo:            11,
  s2Instructions:     12,
  s2Inhouse:          13,
  s2Delay:            14,

  // Step 3 — In house Cutting
  s3Planned:          15,
  s3Actual:           16,
  s3DukanCutting:     17,
  s3SizeDetails:      18,
  s3CuttingPerson:    19,
  s3Delay:            20,

  // Step 4 — Naame
  s4Planned:          23,
  s4StartDate:        24,
  s4Thekedar:         25,
  s4CuttingPcs:       26,
  s4CutToPack:        27,
  s4LeadTime:         28,
  s4VastraJob:        29,
  s4Delay:            33,

  // Step 5 — Finished Maal Jama
  s5LeadTimeHours:    35,
  s5JamaPlanned:      36,
  s5JobslipStatus:    37,
  s5Status:           38,
  s5Balance:          39,
  s5JamaQty:          40,
  s5GivenQty:         41,
  s5Press:            42,
  s5Delay:            43,

  // Step 6 — Settle
  s6SettleQty:        44,
  s6Reason:           45,
  s6Name:             46,
};
