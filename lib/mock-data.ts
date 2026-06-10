// ─────────────────────────────────────────────────────────────────────────────
// Enerflo MVP — static mock data. Edit freely; everything in the app reads from
// here and mutates an in-memory copy (see lib/store.tsx). No backend.
// ─────────────────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "OPS" | "REP" | "SETTER";

export type DealStage =
  | "SETUP"
  | "CONSUMPTION"
  | "DESIGN"
  | "PROPOSAL"
  | "FINANCING"
  | "CONTRACTING"
  | "SUBMITTED"
  | "INSTALL";

export const DEAL_STAGES: DealStage[] = [
  "SETUP",
  "CONSUMPTION",
  "DESIGN",
  "PROPOSAL",
  "FINANCING",
  "CONTRACTING",
  "SUBMITTED",
  "INSTALL",
];

export type StepKey =
  | "prequalification"
  | "requiredForContracting"
  | "consumption"
  | "design"
  | "proposal"
  | "financing"
  | "contracting"
  | "siteSurvey"
  | "submission";

export type StepStatus = "pending" | "active" | "complete";

export type MountingType = "ROOF" | "GROUND" | "PERGOLA";
export type FinanceType = "CASH" | "LOAN" | "LEASE" | "PPA";
export type ProposalStatus = "DRAFT" | "SENT" | "ACCEPTED";
export type ContractStatus = "NOT_SENT" | "SENT" | "SIGNED";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Office {
  id: string;
  name: string;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  officeId: string;
  avatarColor: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  language?: string;
  leadSource?: string;
  officeId?: string;
  textConsent?: boolean;
}

export type AppointmentType = "IN_HOME" | "VIRTUAL";

export interface Appointment {
  id: string;
  title: string;
  customerName: string;
  address: string;
  repId: string;
  type: AppointmentType;
  day: number; // 0=Sun … 6=Sat within the sample week
  hour: number; // 24h, e.g. 9 = 9:00 AM
}

export interface DealNote {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface ConsumptionProfile {
  utility: string;
  annualKwh: number;
  monthly: number[]; // 12 entries
  avgBill: number;
}

export interface DesignArray {
  id: string;
  module: string;
  count: number;
  orientation: string;
  azimuth: number;
  production: number;
}

export interface Design {
  title: string;
  mountingType: MountingType;
  systemSizeKw: number;
  offsetPct: number;
  inverter: string;
  arrays: DesignArray[];
  layoutImageUrl?: string;
  attachments: string[];
}

export interface Adder {
  id: string;
  name: string;
  amount: number;
}

export interface Proposal {
  priceTotal: number;
  adders: Adder[];
  savingsEstimate: number; // estimated lifetime savings
  financeType: FinanceType;
  status: ProposalStatus;
}

export interface FinanceRecord {
  financeType: FinanceType;
  lenderName: string;
  amount: number;
  status: string;
  notes: string;
}

export interface Contract {
  status: ContractStatus;
  signedAt?: string;
}

export interface ChecklistState {
  utilityBill: boolean;
  designComplete: boolean;
  proposalAccepted: boolean;
  financeSet: boolean;
}

export interface DealDocument {
  id: string;
  fileName: string;
}

export interface Deal {
  id: string;
  code: string;
  customerId: string;
  repId: string;
  setterId?: string;
  stage: DealStage;
  projectAddress: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  installerName: string;
  template: string;
  version: string;
  createdAt: string;
  steps: Record<StepKey, StepStatus>;
  consumption?: ConsumptionProfile;
  design?: Design;
  proposal?: Proposal;
  finance?: FinanceRecord;
  contract: Contract;
  checklist: ChecklistState;
  notes: DealNote[];
  documents: DealDocument[];
}

export interface Milestone {
  id: string;
  name: string;
  order: number;
  status: MilestoneStatus;
  ownerId: string;
  dueDate: string;
  notes: string;
}

export interface Install {
  id: string;
  dealId: string;
  customerName: string;
  address: string;
  status: string;
  createdAt: string;
  milestones: Milestone[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  assigneeId: string;
  completed: boolean;
  linkedType: "customer" | "install" | "deal";
  linkedId: string;
  linkedLabel: string;
}

// ── Seed: Offices ────────────────────────────────────────────────────────────
export const offices: Office[] = [
  { id: "off-1", name: "Phoenix HQ", timezone: "America/Phoenix" },
  { id: "off-2", name: "San Bernardino", timezone: "America/Los_Angeles" },
];

// ── Seed: Users ──────────────────────────────────────────────────────────────
export const COMPANY_NAME = "Nox Power LLC";

export const users: User[] = [
  {
    id: "user-1",
    name: "Jonas Lim",
    email: "jonaslim@noxpwr.com",
    phone: "(909) 610-9082",
    role: "ADMIN",
    officeId: "off-1",
    avatarColor: "#10b981",
  },
  {
    id: "user-2",
    name: "Maria Santos",
    email: "maria@noxpwr.com",
    phone: "(614) 286-7301",
    role: "REP",
    officeId: "off-2",
    avatarColor: "#6366f1",
  },
  {
    id: "user-3",
    name: "Derek Cole",
    email: "derek@noxpwr.com",
    phone: "(951) 505-4785",
    role: "OPS",
    officeId: "off-1",
    avatarColor: "#f59e0b",
  },
];

export const CURRENT_USER_ID = "user-1";

// ── Seed: Customers ──────────────────────────────────────────────────────────
export const customers: Customer[] = [
  {
    id: "cust-1",
    firstName: "Robert",
    lastName: "Hayes",
    email: "robert.hayes@gmail.com",
    phone: "(909) 555-0148",
    address: "840 Medical Center Dr, San Bernardino, CA 92411",
    language: "English",
    leadSource: "Door Knock",
    officeId: "off-2",
    textConsent: true,
  },
  {
    id: "cust-2",
    firstName: "Angela",
    lastName: "Brooks",
    email: "angela.brooks@outlook.com",
    phone: "(480) 555-0192",
    address: "1523 E Camelback Rd, Phoenix, AZ 85016",
    language: "English",
    leadSource: "Referral",
    officeId: "off-1",
    textConsent: true,
  },
  {
    id: "cust-3",
    firstName: "Marcus",
    lastName: "Webb",
    email: "marcus.webb@yahoo.com",
    phone: "(760) 555-0173",
    address: "67 Sunrise Ln, Palm Springs, CA 92262",
    language: "Spanish",
    leadSource: "Web Form",
    officeId: "off-2",
  },
];

const monthly12 = [
  920, 880, 760, 690, 740, 980, 1240, 1310, 1180, 870, 780, 900,
];

// ── Seed: Deals ──────────────────────────────────────────────────────────────
export const deals: Deal[] = [
  // 1) Fully filled deal (every step complete, in INSTALL)
  {
    id: "deal-1",
    code: "3032229",
    customerId: "cust-1",
    repId: "user-1",
    setterId: "user-2",
    stage: "INSTALL",
    projectAddress: "840 Medical Center Dr",
    city: "San Bernardino",
    state: "CA",
    zip: "92411",
    lat: 34.1083,
    lng: -117.3331,
    installerName: "Axia Solar Corp",
    template: "Axia Solar/Nox - Sales Deal",
    version: "3 (current)",
    createdAt: "2026-05-02",
    steps: {
      prequalification: "complete",
      requiredForContracting: "complete",
      consumption: "complete",
      design: "complete",
      proposal: "complete",
      financing: "complete",
      contracting: "complete",
      siteSurvey: "complete",
      submission: "complete",
    },
    consumption: {
      utility: "Southern California Edison",
      annualKwh: 11250,
      monthly: monthly12,
      avgBill: 214,
    },
    design: {
      title: "Hayes Residence - Design 1",
      mountingType: "ROOF",
      systemSizeKw: 8.4,
      offsetPct: 102,
      inverter: "Enphase IQ8+",
      arrays: [
        {
          id: "arr-1",
          module: "REC Alpha Pure 410W",
          count: 14,
          orientation: "South",
          azimuth: 180,
          production: 6450,
        },
        {
          id: "arr-2",
          module: "REC Alpha Pure 410W",
          count: 6,
          orientation: "West",
          azimuth: 270,
          production: 2310,
        },
      ],
      layoutImageUrl: "",
      attachments: ["aurora-design-v3.pdf", "shade-report.pdf"],
    },
    proposal: {
      priceTotal: 28560,
      adders: [
        { id: "add-1", name: "Main Panel Upgrade", amount: 2500 },
        { id: "add-2", name: "Squirrel Guard", amount: 650 },
      ],
      savingsEstimate: 41200,
      financeType: "LOAN",
      status: "ACCEPTED",
    },
    finance: {
      financeType: "LOAN",
      lenderName: "GoodLeap",
      amount: 28560,
      status: "Approved",
      notes: "25-year, 3.99% APR. Stips cleared.",
    },
    contract: { status: "SIGNED", signedAt: "2026-05-09" },
    checklist: {
      utilityBill: true,
      designComplete: true,
      proposalAccepted: true,
      financeSet: true,
    },
    notes: [
      {
        id: "note-1",
        authorId: "user-2",
        body: "Customer prefers morning install. Gate code 4417.",
        createdAt: "2026-05-05",
      },
      {
        id: "note-2",
        authorId: "user-1",
        body: "Loan docs signed, ready for submission.",
        createdAt: "2026-05-09",
      },
    ],
    documents: [
      { id: "doc-1", fileName: "utility-bill.pdf" },
      { id: "doc-2", fileName: "signed-contract.pdf" },
      { id: "doc-3", fileName: "loan-approval.pdf" },
    ],
  },

  // 2) PROPOSAL stage
  {
    id: "deal-2",
    code: "3032040",
    customerId: "cust-2",
    repId: "user-2",
    stage: "PROPOSAL",
    projectAddress: "1523 E Camelback Rd",
    city: "Phoenix",
    state: "AZ",
    zip: "85016",
    lat: 33.5092,
    lng: -112.0455,
    installerName: "Nox Power In-House",
    template: "Nox - Standard Residential",
    version: "2 (current)",
    createdAt: "2026-05-18",
    steps: {
      prequalification: "complete",
      requiredForContracting: "complete",
      consumption: "complete",
      design: "complete",
      proposal: "active",
      financing: "pending",
      contracting: "pending",
      siteSurvey: "pending",
      submission: "pending",
    },
    consumption: {
      utility: "Arizona Public Service",
      annualKwh: 14300,
      monthly: monthly12.map((m) => Math.round(m * 1.25)),
      avgBill: 268,
    },
    design: {
      title: "Brooks Residence - Design 1",
      mountingType: "ROOF",
      systemSizeKw: 10.25,
      offsetPct: 98,
      inverter: "SolarEdge HD-Wave",
      arrays: [
        {
          id: "arr-3",
          module: "Q CELLS Q.PEAK 400W",
          count: 25,
          orientation: "South",
          azimuth: 175,
          production: 9800,
        },
      ],
      layoutImageUrl: "",
      attachments: ["opensolar-design.pdf"],
    },
    proposal: {
      priceTotal: 33900,
      adders: [{ id: "add-3", name: "Battery - Enphase 5P", amount: 9800 }],
      savingsEstimate: 52600,
      financeType: "LOAN",
      status: "SENT",
    },
    contract: { status: "NOT_SENT" },
    checklist: {
      utilityBill: true,
      designComplete: true,
      proposalAccepted: false,
      financeSet: false,
    },
    notes: [
      {
        id: "note-3",
        authorId: "user-2",
        body: "Sent proposal with battery option. Following up Friday.",
        createdAt: "2026-05-20",
      },
    ],
    documents: [{ id: "doc-4", fileName: "utility-bill.pdf" }],
  },

  // 3) DESIGN stage
  {
    id: "deal-3",
    code: "3032007",
    customerId: "cust-3",
    repId: "user-2",
    setterId: "user-2",
    stage: "DESIGN",
    projectAddress: "67 Sunrise Ln",
    city: "Palm Springs",
    state: "CA",
    zip: "92262",
    lat: 33.8303,
    lng: -116.5453,
    installerName: "Axia Solar Corp",
    template: "Axia Solar/Nox - Sales Deal",
    version: "3 (current)",
    createdAt: "2026-05-26",
    steps: {
      prequalification: "complete",
      requiredForContracting: "complete",
      consumption: "complete",
      design: "active",
      proposal: "pending",
      financing: "pending",
      contracting: "pending",
      siteSurvey: "pending",
      submission: "pending",
    },
    consumption: {
      utility: "Southern California Edison",
      annualKwh: 9600,
      monthly: monthly12.map((m) => Math.round(m * 0.85)),
      avgBill: 182,
    },
    contract: { status: "NOT_SENT" },
    checklist: {
      utilityBill: true,
      designComplete: false,
      proposalAccepted: false,
      financeSet: false,
    },
    notes: [],
    documents: [{ id: "doc-5", fileName: "utility-bill.pdf" }],
  },

  // 4) CONSUMPTION stage
  {
    id: "deal-4",
    code: "3031921",
    customerId: "cust-2",
    repId: "user-1",
    stage: "CONSUMPTION",
    projectAddress: "1523 E Camelback Rd",
    city: "Phoenix",
    state: "AZ",
    zip: "85016",
    lat: 33.5092,
    lng: -112.0455,
    installerName: "Nox Power In-House",
    template: "Nox - Standard Residential",
    version: "2 (current)",
    createdAt: "2026-06-01",
    steps: {
      prequalification: "complete",
      requiredForContracting: "complete",
      consumption: "active",
      design: "pending",
      proposal: "pending",
      financing: "pending",
      contracting: "pending",
      siteSurvey: "pending",
      submission: "pending",
    },
    contract: { status: "NOT_SENT" },
    checklist: {
      utilityBill: false,
      designComplete: false,
      proposalAccepted: false,
      financeSet: false,
    },
    notes: [],
    documents: [],
  },

  // 5) SETUP stage
  {
    id: "deal-5",
    code: "3031905",
    customerId: "cust-1",
    repId: "user-2",
    stage: "SETUP",
    projectAddress: "840 Medical Center Dr",
    city: "San Bernardino",
    state: "CA",
    zip: "92411",
    lat: 34.1083,
    lng: -117.3331,
    installerName: "Axia Solar Corp",
    template: "Axia Solar/Nox - Sales Deal",
    version: "3 (current)",
    createdAt: "2026-06-08",
    steps: {
      prequalification: "active",
      requiredForContracting: "pending",
      consumption: "pending",
      design: "pending",
      proposal: "pending",
      financing: "pending",
      contracting: "pending",
      siteSurvey: "pending",
      submission: "pending",
    },
    contract: { status: "NOT_SENT" },
    checklist: {
      utilityBill: false,
      designComplete: false,
      proposalAccepted: false,
      financeSet: false,
    },
    notes: [],
    documents: [],
  },
];

// ── Seed: Installs ───────────────────────────────────────────────────────────
function milestone(
  id: string,
  name: string,
  order: number,
  status: MilestoneStatus,
  ownerId: string,
  dueDate: string,
  notes = ""
): Milestone {
  return { id, name, order, status, ownerId, dueDate, notes };
}

export const installs: Install[] = [
  {
    id: "inst-1",
    dealId: "deal-1",
    customerName: "Robert Hayes",
    address: "840 Medical Center Dr, San Bernardino, CA",
    status: "In Progress",
    createdAt: "2026-05-09",
    milestones: [
      milestone("ms-1", "Site Survey", 1, "DONE", "user-3", "2026-05-14", "Survey complete, roof in good condition."),
      milestone("ms-2", "Permitting", 2, "DONE", "user-3", "2026-05-22", "City permit approved."),
      milestone("ms-3", "Installation", 3, "IN_PROGRESS", "user-3", "2026-06-15", "Crew scheduled for 6/14-6/15."),
      milestone("ms-4", "Inspection", 4, "PENDING", "user-3", "2026-06-20"),
      milestone("ms-5", "PTO", 5, "PENDING", "user-1", "2026-07-01"),
    ],
  },
  {
    id: "inst-2",
    dealId: "deal-1",
    customerName: "Angela Brooks",
    address: "1523 E Camelback Rd, Phoenix, AZ",
    status: "Permitting",
    createdAt: "2026-05-28",
    milestones: [
      milestone("ms-6", "Site Survey", 1, "DONE", "user-3", "2026-06-02", "Completed."),
      milestone("ms-7", "Permitting", 2, "IN_PROGRESS", "user-3", "2026-06-18", "Awaiting city response."),
      milestone("ms-8", "Installation", 3, "PENDING", "user-3", "2026-06-30"),
      milestone("ms-9", "Inspection", 4, "PENDING", "user-3", "2026-07-08"),
      milestone("ms-10", "PTO", 5, "PENDING", "user-1", "2026-07-20"),
    ],
  },
  {
    id: "inst-3",
    dealId: "deal-1",
    customerName: "Marcus Webb",
    address: "67 Sunrise Ln, Palm Springs, CA",
    status: "Survey",
    createdAt: "2026-06-05",
    milestones: [
      milestone("ms-11", "Site Survey", 1, "IN_PROGRESS", "user-3", "2026-06-12", "Survey booked 6/12."),
      milestone("ms-12", "Permitting", 2, "PENDING", "user-3", "2026-06-25"),
      milestone("ms-13", "Installation", 3, "PENDING", "user-3", "2026-07-10"),
      milestone("ms-14", "Inspection", 4, "PENDING", "user-3", "2026-07-18"),
      milestone("ms-15", "PTO", 5, "PENDING", "user-1", "2026-07-30"),
    ],
  },
];

// ── Seed: Tasks ──────────────────────────────────────────────────────────────
export const tasks: Task[] = [
  {
    id: "task-1",
    title: "Upload utility bill for Webb deal",
    dueDate: "2026-06-09",
    assigneeId: "user-1",
    completed: false,
    linkedType: "deal",
    linkedId: "deal-3",
    linkedLabel: "Marcus Webb - Deal",
  },
  {
    id: "task-2",
    title: "Schedule site survey for Hayes install",
    dueDate: "2026-06-13",
    assigneeId: "user-1",
    completed: false,
    linkedType: "install",
    linkedId: "inst-1",
    linkedLabel: "Robert Hayes - Install",
  },
  {
    id: "task-3",
    title: "Follow up on Brooks proposal",
    dueDate: "2026-06-05",
    assigneeId: "user-1",
    completed: false,
    linkedType: "deal",
    linkedId: "deal-2",
    linkedLabel: "Angela Brooks - Deal",
  },
  {
    id: "task-4",
    title: "Send welcome packet to Robert Hayes",
    dueDate: "2026-05-30",
    assigneeId: "user-1",
    completed: true,
    linkedType: "customer",
    linkedId: "cust-1",
    linkedLabel: "Robert Hayes",
  },
  {
    id: "task-5",
    title: "Confirm permit status with city for Brooks",
    dueDate: "2026-06-18",
    assigneeId: "user-1",
    completed: false,
    linkedType: "install",
    linkedId: "inst-2",
    linkedLabel: "Angela Brooks - Install",
  },
];

// ── Lookups ──────────────────────────────────────────────────────────────────
export function userById(id?: string): User | undefined {
  return users.find((u) => u.id === id);
}
export function customerById(id?: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
export function customerName(id?: string): string {
  const c = customerById(id);
  return c ? `${c.firstName} ${c.lastName}` : "Unknown";
}
export function officeById(id?: string): Office | undefined {
  return offices.find((o) => o.id === id);
}

export const STEP_ORDER: StepKey[] = [
  "prequalification",
  "requiredForContracting",
  "consumption",
  "design",
  "proposal",
  "financing",
  "contracting",
  "siteSurvey",
  "submission",
];

export const STEP_LABELS: Record<StepKey, string> = {
  prequalification: "Prequalification",
  requiredForContracting: "Required for Contracting",
  consumption: "Consumption",
  design: "Designs",
  proposal: "Proposal",
  financing: "Financing",
  contracting: "Contracting",
  siteSurvey: "Sales Team Site Survey",
  submission: "Project Submission",
};

export const INVERTER_OPTIONS = [
  "Enphase IQ8+",
  "Enphase IQ8M",
  "SolarEdge HD-Wave",
  "SolarEdge Energy Hub",
  "Tesla Inverter",
];

export const MODULE_OPTIONS = [
  "REC Alpha Pure 410W",
  "Q CELLS Q.PEAK 400W",
  "Silfab Elite 430W",
  "Maxeon 6 440W",
];

export const LANGUAGE_OPTIONS = ["English", "Spanish"];

export const LEAD_SOURCES = [
  "Door Knock",
  "Referral",
  "Web Form",
  "Trade Show",
  "Social Media",
  "Cold Call",
];

export const US_STATES = [
  "AZ", "CA", "CO", "FL", "NV", "NM", "OR", "TX", "UT", "WA",
];

// ── Seed: Appointments (sample week: Sun Jun 7 – Sat Jun 13, 2026) ────────────
export const APPT_WEEK_LABEL = "Sunday, June 07, 2026 - Saturday, June 13, 2026";
export const APPT_DAYS = [
  { label: "Sun", date: "6/07" },
  { label: "Mon", date: "6/08" },
  { label: "Tue", date: "6/09" },
  { label: "Wed", date: "6/10" },
  { label: "Thu", date: "6/11" },
  { label: "Fri", date: "6/12" },
  { label: "Sat", date: "6/13" },
];
export const APPT_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function appt(
  id: string,
  customerName: string,
  address: string,
  repId: string,
  type: AppointmentType,
  day: number,
  hour: number
): Appointment {
  return { id, title: "Consultation", customerName, address, repId, type, day, hour };
}

export const appointments: Appointment[] = [
  appt("ap-1", "Daniel Garcia", "5444 Altos Ave, Sacramento, CA", "user-1", "IN_HOME", 0, 7),
  appt("ap-2", "Lena Brooks", "1415 Lincoln Pk Dr, Sacramento, CA", "user-2", "VIRTUAL", 0, 7),
  appt("ap-3", "Marisa Cole", "7005 Manzita Tree Ct, Sacramento, CA", "user-1", "IN_HOME", 0, 8),
  appt("ap-4", "Roy Bridgewater", "2704 Heritage Pl, Sacramento, CA", "user-2", "IN_HOME", 0, 9),
  appt("ap-5", "Christian Garcia", "5444 Altos Ave, Sacramento, CA", "user-1", "IN_HOME", 0, 11),

  appt("ap-6", "Eduardo Diaz", "60699 Acoma Ave, Desert Hot Springs, CA", "user-2", "IN_HOME", 1, 7),
  appt("ap-7", "Grayson Heskan", "13900 Agua Caliente Rd, Desert Hot Springs, CA", "user-1", "VIRTUAL", 1, 8),
  appt("ap-8", "Steven Gutholson", "1426 Dove Ln, Yreka, CA", "user-2", "IN_HOME", 1, 11),
  appt("ap-9", "Bonnie Park", "900 S Phillips Ln, Montague, CA", "user-1", "IN_HOME", 1, 11),

  appt("ap-10", "Krisanne Webb", "21 Kirkwood Dr, Clinton, IL", "user-1", "IN_HOME", 3, 7),
  appt("ap-11", "Maria Lopez", "221 E King St, Sacramento, CA", "user-2", "VIRTUAL", 3, 7),
  appt("ap-12", "Aurum Park", "25 Aurum Park, Sacramento, CA", "user-1", "IN_HOME", 3, 9),
  appt("ap-13", "Joseph Lin", "3635 Aquino Dr, Sacramento, CA", "user-2", "IN_HOME", 3, 9),
  appt("ap-14", "Tatiana Vista", "436 Curtas Ave, Sacramento, CA", "user-1", "IN_HOME", 3, 11),
  appt("ap-15", "Nikolai Ross", "3818 Kern St, Sacramento, CA", "user-2", "IN_HOME", 3, 11),

  appt("ap-16", "Alexander Mireles", "S42 Witte Hassey Way, Sacramento, CA", "user-2", "IN_HOME", 4, 10),

  appt("ap-17", "Victor Diaz", "3331 Oak on Ridge Dr, Plainfield, IL", "user-1", "IN_HOME", 5, 7),
  appt("ap-18", "Kenia Naig", "3417 Kenia Way, Sacramento, CA", "user-2", "VIRTUAL", 5, 7),
  appt("ap-19", "Tricia Swift", "1561 Waterford Rd, Sacramento, CA", "user-1", "IN_HOME", 5, 9),
  appt("ap-20", "Devon Mills", "912 N G Centre Ave, Sacramento, CA", "user-2", "IN_HOME", 5, 9),

  appt("ap-21", "Owen Carter", "1417 Owen Dr, Sacramento, CA", "user-1", "IN_HOME", 6, 7),
  appt("ap-22", "Riley James", "3839 F Sears Ct, Gilbert, AZ", "user-2", "IN_HOME", 6, 9),
];

export function appointmentsForUser(role: Role, userId: string): Appointment[] {
  if (role === "ADMIN") return appointments;
  return appointments.filter((a) => a.repId === userId);
}

// ── Derived helpers for grid views ───────────────────────────────────────────
export function dealProgress(deal: Deal): number {
  const total = STEP_ORDER.length;
  const done = STEP_ORDER.filter((s) => deal.steps[s] === "complete").length;
  return Math.round((done / total) * 100);
}

export function installProgress(install: Install): number {
  const done = install.milestones.filter((m) => m.status === "DONE").length;
  return Math.round((done / install.milestones.length) * 100);
}

export function currentMilestone(install: Install): string {
  const next = [...install.milestones]
    .sort((a, b) => a.order - b.order)
    .find((m) => m.status !== "DONE");
  return next ? `${next.name} (${next.status === "IN_PROGRESS" ? "in progress" : "pending"})` : "Complete";
}

export function lastCompletedMilestone(install: Install): string {
  const done = [...install.milestones]
    .filter((m) => m.status === "DONE")
    .sort((a, b) => b.order - a.order);
  return done[0]?.name ?? "—";
}

export function projectManager(install: Install): User | undefined {
  const installMs = install.milestones.find((m) => m.name === "Installation");
  return userById(installMs?.ownerId);
}
