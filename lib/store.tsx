"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  customers as seedCustomers,
  deals as seedDeals,
  installs as seedInstalls,
  tasks as seedTasks,
  users as seedUsers,
  offices as seedOffices,
  DEAL_STAGES,
  STEP_ORDER,
  type Customer,
  type Deal,
  type Install,
  type Task,
  type User,
  type Office,
  type StepKey,
  type MilestoneStatus,
  type DealStage,
} from "./mock-data";

// Deep-clone seed data so edits during a session don't mutate the module export.
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

interface StoreValue {
  customers: Customer[];
  deals: Deal[];
  installs: Install[];
  tasks: Task[];
  users: User[];
  offices: Office[];

  addCustomer: (c: Omit<Customer, "id">) => Customer;
  addDeal: (d: Partial<Deal> & { customerId: string; repId: string }) => Deal;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  completeStep: (dealId: string, step: StepKey) => void;
  submitDeal: (dealId: string) => void;

  setMilestoneStatus: (
    installId: string,
    milestoneId: string,
    status: MilestoneStatus
  ) => void;
  setMilestoneNotes: (
    installId: string,
    milestoneId: string,
    notes: string
  ) => void;

  toggleTask: (id: string) => void;
  addTask: (t: Omit<Task, "id">) => void;

  addUser: (u: Omit<User, "id">) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const STAGE_FOR_STEP: Record<StepKey, DealStage> = {
  prequalification: "SETUP",
  requiredForContracting: "SETUP",
  consumption: "CONSUMPTION",
  design: "DESIGN",
  proposal: "PROPOSAL",
  financing: "FINANCING",
  contracting: "CONTRACTING",
  siteSurvey: "CONTRACTING",
  submission: "SUBMITTED",
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() =>
    clone(seedCustomers)
  );
  const [deals, setDeals] = useState<Deal[]>(() => clone(seedDeals));
  const [installs, setInstalls] = useState<Install[]>(() =>
    clone(seedInstalls)
  );
  const [tasks, setTasks] = useState<Task[]>(() => clone(seedTasks));
  const [users, setUsers] = useState<User[]>(() => clone(seedUsers));
  const [offices] = useState<Office[]>(() => clone(seedOffices));

  const addCustomer = useCallback((c: Omit<Customer, "id">) => {
    const created: Customer = { ...c, id: nextId("cust") };
    setCustomers((prev) => [created, ...prev]);
    return created;
  }, []);

  const addDeal = useCallback(
    (d: Partial<Deal> & { customerId: string; repId: string }) => {
      const created: Deal = {
        id: nextId("deal"),
        code: String(3032230 + (idCounter % 1000)),
        customerId: d.customerId,
        repId: d.repId,
        setterId: d.setterId,
        stage: "SETUP",
        projectAddress: d.projectAddress ?? "",
        city: d.city ?? "",
        state: d.state ?? "",
        zip: d.zip ?? "",
        lat: d.lat ?? 34.05,
        lng: d.lng ?? -117.75,
        installerName: d.installerName ?? "",
        template: d.template ?? "",
        version: d.version ?? "1 (current)",
        createdAt: new Date().toISOString().slice(0, 10),
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
      };
      setDeals((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateDeal = useCallback((id: string, patch: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }, []);

  const completeStep = useCallback((dealId: string, step: StepKey) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        const steps = { ...d.steps, [step]: "complete" as const };
        const idx = STEP_ORDER.indexOf(step);
        const next = STEP_ORDER[idx + 1];
        if (next && steps[next] === "pending") steps[next] = "active";
        // advance stage roughly to the next step's stage
        const stage =
          DEAL_STAGES.indexOf(STAGE_FOR_STEP[step]) >
          DEAL_STAGES.indexOf(d.stage)
            ? STAGE_FOR_STEP[step]
            : d.stage;
        return { ...d, steps, stage };
      })
    );
  }, []);

  const submitDeal = useCallback(
    (dealId: string) => {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? {
                ...d,
                stage: "SUBMITTED",
                steps: { ...d.steps, submission: "complete" },
              }
            : d
        )
      );
      // spawn an install if one doesn't exist for this deal
      setInstalls((prev) => {
        if (prev.some((i) => i.dealId === dealId)) return prev;
        const deal = deals.find((d) => d.id === dealId);
        if (!deal) return prev;
        const cust = customers.find((c) => c.id === deal.customerId);
        const name = cust ? `${cust.firstName} ${cust.lastName}` : "Customer";
        const today = new Date().toISOString().slice(0, 10);
        const newInstall: Install = {
          id: nextId("inst"),
          dealId,
          customerName: name,
          address: `${deal.projectAddress}, ${deal.city}, ${deal.state}`,
          status: "Survey",
          createdAt: today,
          milestones: [
            { id: nextId("ms"), name: "Site Survey", order: 1, status: "PENDING", ownerId: "user-3", dueDate: today, notes: "" },
            { id: nextId("ms"), name: "Permitting", order: 2, status: "PENDING", ownerId: "user-3", dueDate: today, notes: "" },
            { id: nextId("ms"), name: "Installation", order: 3, status: "PENDING", ownerId: "user-3", dueDate: today, notes: "" },
            { id: nextId("ms"), name: "Inspection", order: 4, status: "PENDING", ownerId: "user-3", dueDate: today, notes: "" },
            { id: nextId("ms"), name: "PTO", order: 5, status: "PENDING", ownerId: "user-1", dueDate: today, notes: "" },
          ],
        };
        return [newInstall, ...prev];
      });
    },
    [deals, customers]
  );

  const setMilestoneStatus = useCallback(
    (installId: string, milestoneId: string, status: MilestoneStatus) => {
      setInstalls((prev) =>
        prev.map((i) =>
          i.id === installId
            ? {
                ...i,
                milestones: i.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, status } : m
                ),
              }
            : i
        )
      );
    },
    []
  );

  const setMilestoneNotes = useCallback(
    (installId: string, milestoneId: string, notes: string) => {
      setInstalls((prev) =>
        prev.map((i) =>
          i.id === installId
            ? {
                ...i,
                milestones: i.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, notes } : m
                ),
              }
            : i
        )
      );
    },
    []
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const addTask = useCallback((t: Omit<Task, "id">) => {
    setTasks((prev) => [{ ...t, id: nextId("task") }, ...prev]);
  }, []);

  const addUser = useCallback((u: Omit<User, "id">) => {
    setUsers((prev) => [...prev, { ...u, id: nextId("user") }]);
  }, []);

  const value: StoreValue = {
    customers,
    deals,
    installs,
    tasks,
    users,
    offices,
    addCustomer,
    addDeal,
    updateDeal,
    completeStep,
    submitDeal,
    setMilestoneStatus,
    setMilestoneNotes,
    toggleTask,
    addTask,
    addUser,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
