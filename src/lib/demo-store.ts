import { create } from "zustand";
import { isDuplicateUtr } from "./finance";
import { nowTime, todayLabel } from "./format";

/* In-memory sample data for the ResiCore clickable demo. Nothing is saved. */

export type Role = "admin" | "secretary" | "resident" | "guard";
export const APARTMENT = "Lake View Residency";
export const MONTH = "Nov 2026";
export const ME_FLAT = "A-302";
export const OPENING = { cash: 42000, bank: 142500 };

export type FlatStatus = "Occupied" | "Vacant" | "Rented" | "Under Maintenance";
export interface Flat {
  id: string; block: string; floor: number; bhk: string; status: FlatStatus;
  owner: string; tenant?: string; phone: string; monthly: number; paid: number;
  prevDue: number; reg: "Approved" | "Pending" | "Deactivated"; slot?: string;
}
export interface Payment {
  id: string; flatId: string; amount: number; mode: "Cash" | "UPI" | "Bank";
  utr?: string; date: string; status: "Pending" | "Approved" | "Rejected"; month: string; screenshot?: string;
}
export interface Expense { id: string; category: string; description: string; amount: number; date: string; mode: "Cash" | "Bank" | "UPI"; month: string }
export type ComplaintStatus = "Submitted" | "Approved" | "In Progress" | "Resolved" | "Rejected";
export interface Complaint {
  id: string; flatId: string; resident: string; category: string; description: string;
  priority: "Low" | "Medium" | "High" | "Emergency"; status: ComplaintStatus; date: string;
  assigned?: string; area: "Flat" | "Common area"; comments: string[];
}
export type VisitorStatus = "Pending" | "Approved" | "Rejected" | "Inside" | "Exited";
export interface Visitor {
  id: string; name: string; phone: string; flatId: string; purpose: string;
  type: "Guest" | "Delivery" | "Cab" | "Service Provider" | "Other";
  status: VisitorStatus; entry?: string; exit?: string; code: string; date: string;
}
export interface Notice { id: string; title: string; body: string; date: string; tag: "General" | "Maintenance" | "Urgent" | "Event" }
export interface EventItem { id: string; title: string; date: string; venue: string; description: string; going: number; maybe: number; no: number; my?: "Going" | "Maybe" | "No"; past?: boolean; photos?: number }
export interface Poll { id: string; question: string; options: { label: string; votes: number }[]; my?: number; closes: string }
export interface Fund { id: string; name: string; purpose: string; target: number; collected: number; perUnit: number; closes: string; mine: number }
export interface Vehicle { id: string; number: string; model: string; type: "Car" | "Bike" | "Scooter" | "Other"; flatId: string; owner: string; status: "Approved" | "Pending" }
export interface Slot { id: string; type: "Car" | "Bike" | "Visitor"; flatId?: string }
export interface ParkingReport { id: string; vehicle: string; flatId: string; description: string; status: "Open" | "Resolved"; date: string }
export interface Apartment { id: string; name: string; city: string; flats: number; blocks: number; secretary: string; phone: string; status: "Pending" | "Active" | "Rejected" | "Deactivated"; plan: "Free" | "Premium" | "Trial"; renews: string }
export interface Notification { id: string; role: Role; title: string; body: string; time: string; read: boolean }
export interface Staff { id: string; name: string; role: string; phone: string; shift: string; present: boolean; salary: number }
export interface Reminder { id: string; flats: number; time: string; kind: "Individual" | "Bulk" }

const f = (id: string, owner: string, o: Partial<Flat> = {}): Flat => {
  const [block, num] = id.split("-");
  const floor = Number(num[0]);
  const big = num.endsWith("2");
  return {
    id, block, floor, bhk: big ? "3 BHK" : "2 BHK", status: "Occupied", owner,
    phone: "+91 98" + String(4400000 + id.charCodeAt(0) * 1000 + Number(num)).padStart(8, "0"),
    monthly: big ? 4200 : 3500, paid: big ? 4200 : 3500, prevDue: 0, reg: "Approved", ...o,
  };
};

const flats: Flat[] = [
  f("A-101", "Rahul Verma", { paid: 0, prevDue: 3500, slot: "C-01" }),
  f("A-102", "Anita Reddy", { slot: "C-02" }),
  f("A-201", "Vikram Rao", { status: "Rented", tenant: "Sameer Khan", slot: "C-03" }),
  f("A-202", "Sneha Iyer", { paid: 2000 }),
  f("A-301", "Arjun Nair", { status: "Vacant", paid: 0, monthly: 3500 }),
  f("A-302", "Priya Sharma", { paid: 0, prevDue: 0, slot: "C-06" }),
  f("A-401", "Kavya Menon", { paid: 0 }),
  f("A-402", "Suresh Kumar", { status: "Rented", tenant: "Ankit Jain", slot: "C-08" }),
  f("B-101", "Meera Joshi", { slot: "C-09" }),
  f("B-102", "Karthik Das", { paid: 0, prevDue: 4200 }),
  f("B-201", "Lakshmi Pillai", { paid: 0 }),
  f("B-202", "Rohan Gupta", { status: "Under Maintenance", paid: 4200 }),
  f("B-301", "Divya Patel", { slot: "C-11" }),
  f("B-302", "Manoj Singh", { reg: "Pending", paid: 0 }),
  f("B-401", "Neha Kapoor", { status: "Rented", tenant: "Farhan Ali", reg: "Approved" }),
  f("B-402", "Ravi Teja", { paid: 4200, slot: "C-12" }),
];

const payments: Payment[] = [
  ...flats.filter((x) => x.paid > 0).map((x, i): Payment => ({
    id: "P" + (100 + i), flatId: x.id, amount: x.paid, mode: i % 3 === 0 ? "Cash" : i % 3 === 1 ? "UPI" : "Bank",
    utr: i % 3 === 0 ? undefined : "UTR" + (845210 + i * 37), date: `0${(i % 9) + 1} Nov 2026`, status: "Approved", month: MONTH,
  })),
  { id: "P200", flatId: "B-201", amount: 3500, mode: "UPI", utr: "UTR908812", date: "14 Nov 2026", status: "Pending", month: MONTH, screenshot: "gpay-receipt.jpg" },
  { id: "P201", flatId: "A-401", amount: 3500, mode: "Bank", utr: "NEFT55120", date: "15 Nov 2026", status: "Pending", month: MONTH, screenshot: "bank-transfer.png" },
  { id: "P050", flatId: "A-302", amount: 3500, mode: "UPI", utr: "UTR771023", date: "08 Oct 2026", status: "Approved", month: "Oct 2026" },
  { id: "P051", flatId: "A-302", amount: 3500, mode: "UPI", utr: "UTR660914", date: "07 Sep 2026", status: "Approved", month: "Sep 2026" },
];

export const EXPENSE_CATEGORIES = ["Electricity", "Water", "Security", "Housekeeping", "Lift maintenance", "Plumbing", "Repairs", "Gardening", "Generator", "Staff salaries", "Other expenses"];

const expenses: Expense[] = [
  { id: "E1", category: "Electricity", description: "Common area power bill", amount: 8400, date: "05 Nov 2026", mode: "Bank", month: MONTH },
  { id: "E2", category: "Security", description: "Guard agency — November", amount: 12000, date: "03 Nov 2026", mode: "Bank", month: MONTH },
  { id: "E3", category: "Housekeeping", description: "Cleaning supplies", amount: 2100, date: "06 Nov 2026", mode: "Cash", month: MONTH },
  { id: "E4", category: "Lift maintenance", description: "AMC quarterly visit", amount: 4500, date: "10 Nov 2026", mode: "UPI", month: MONTH },
  { id: "E5", category: "Water", description: "Tanker × 2", amount: 3000, date: "12 Nov 2026", mode: "Cash", month: MONTH },
  { id: "E6", category: "Gardening", description: "Plants and manure", amount: 950, date: "13 Nov 2026", mode: "Cash", month: MONTH },
];

const complaints: Complaint[] = [
  { id: "C-1042", flatId: "A-302", resident: "Priya Sharma", category: "Plumbing", description: "Kitchen sink leaking under the cabinet.", priority: "Medium", status: "In Progress", date: "12 Nov 2026", assigned: "Ramesh (Plumber)", area: "Flat", comments: ["Plumber visiting tomorrow 11 AM."] },
  { id: "C-1041", flatId: "B-102", resident: "Karthik Das", category: "Lift", description: "Block B lift stops between floors 2 and 3.", priority: "Emergency", status: "Submitted", date: "15 Nov 2026", area: "Common area", comments: [] },
  { id: "C-1039", flatId: "A-202", resident: "Sneha Iyer", category: "Electrical", description: "Corridor light on 2nd floor not working.", priority: "Low", status: "Approved", date: "10 Nov 2026", area: "Common area", comments: [] },
  { id: "C-1031", flatId: "B-301", resident: "Divya Patel", category: "Housekeeping", description: "Garbage not collected for two days.", priority: "High", status: "Resolved", date: "02 Nov 2026", assigned: "Housekeeping team", area: "Common area", comments: ["Resolved — schedule fixed."] },
];

const visitors: Visitor[] = [
  { id: "V1", name: "Swiggy delivery", phone: "+91 90000 11223", flatId: "A-302", purpose: "Food delivery", type: "Delivery", status: "Pending", code: "418273", date: "Today" },
  { id: "V2", name: "Ananya Rao", phone: "+91 98111 22334", flatId: "A-302", purpose: "Family visit", type: "Guest", status: "Approved", code: "552901", date: "Today" },
  { id: "V3", name: "Urban Company — AC", phone: "+91 90909 44556", flatId: "B-101", purpose: "AC service", type: "Service Provider", status: "Inside", entry: "10:15", code: "730114", date: "Today" },
  { id: "V4", name: "Uber — KA 01 AB 2231", phone: "+91 97777 55667", flatId: "A-202", purpose: "Pickup", type: "Cab", status: "Exited", entry: "08:40", exit: "08:52", code: "120998", date: "Today" },
  { id: "V5", name: "Amazon delivery", phone: "+91 96666 77889", flatId: "B-402", purpose: "Parcel", type: "Delivery", status: "Exited", entry: "09:05", exit: "09:09", code: "661203", date: "Today" },
  { id: "V6", name: "Deepak Menon", phone: "+91 95555 12121", flatId: "A-401", purpose: "Friend", type: "Guest", status: "Exited", entry: "18:20", exit: "21:45", code: "903311", date: "Yesterday" },
];

const notices: Notice[] = [
  { id: "N1", title: "Water supply off on Saturday", body: "Tank cleaning between 10 AM and 2 PM. Please store water in advance.", date: "16 Nov 2026", tag: "Maintenance" },
  { id: "N2", title: "November maintenance due on 10th", body: "Pay through UPI and upload your transaction ID in the app.", date: "01 Nov 2026", tag: "General" },
  { id: "N3", title: "Fire drill on 22 Nov", body: "Assemble at the main gate when the alarm rings at 11 AM.", date: "14 Nov 2026", tag: "Urgent" },
];

const events: EventItem[] = [
  { id: "EV1", title: "Children's Day Carnival", date: "23 Nov 2026 · 5:00 PM", venue: "Clubhouse lawn", description: "Games, food stalls and a magic show for kids.", going: 34, maybe: 9, no: 3 },
  { id: "EV2", title: "Association General Meeting", date: "30 Nov 2026 · 7:00 PM", venue: "Community hall", description: "Budget review and election of committee.", going: 18, maybe: 12, no: 2 },
  { id: "EV3", title: "Diwali Celebration", date: "01 Nov 2026", venue: "Central courtyard", description: "Lights, rangoli and dinner.", going: 92, maybe: 0, no: 0, past: true, photos: 48 },
];

const polls: Poll[] = [
  { id: "PL1", question: "Should we renovate the clubhouse?", options: [{ label: "Yes", votes: 21 }, { label: "No", votes: 6 }, { label: "Later", votes: 4 }], closes: "25 Nov 2026" },
  { id: "PL2", question: "Preferred gym timings on weekends?", options: [{ label: "5–9 AM", votes: 11 }, { label: "6–10 AM", votes: 15 }, { label: "All day", votes: 9 }], closes: "20 Nov 2026" },
];

const funds: Fund[] = [
  { id: "F1", name: "CCTV upgrade", purpose: "Replace 16 cameras with HD night-vision units", target: 120000, collected: 74000, perUnit: 7500, closes: "15 Dec 2026", mine: 0 },
  { id: "F2", name: "Festival fund", purpose: "Diwali and New Year celebrations", target: 40000, collected: 40000, perUnit: 2500, closes: "31 Oct 2026", mine: 2500 },
];

const vehicles: Vehicle[] = [
  { id: "VH1", number: "TS 09 EK 4512", model: "Hyundai Creta", type: "Car", flatId: "A-302", owner: "Priya Sharma", status: "Approved" },
  { id: "VH2", number: "TS 07 AB 1180", model: "Honda Activa", type: "Scooter", flatId: "A-302", owner: "Priya Sharma", status: "Approved" },
  { id: "VH3", number: "TS 10 CZ 9087", model: "Maruti Swift", type: "Car", flatId: "A-101", owner: "Rahul Verma", status: "Approved" },
  { id: "VH4", number: "AP 39 HK 2201", model: "Royal Enfield", type: "Bike", flatId: "B-102", owner: "Karthik Das", status: "Pending" },
  { id: "VH5", number: "TS 08 GH 7734", model: "Tata Nexon", type: "Car", flatId: "B-301", owner: "Divya Patel", status: "Approved" },
];

const slots: Slot[] = [
  ...Array.from({ length: 14 }, (_, i): Slot => {
    const id = "C-" + String(i + 1).padStart(2, "0");
    return { id, type: "Car", flatId: flats.find((x) => x.slot === id)?.id };
  }),
  ...Array.from({ length: 8 }, (_, i): Slot => ({ id: "B-" + String(i + 1).padStart(2, "0"), type: "Bike", flatId: i < 5 ? flats[i * 3].id : undefined })),
  ...Array.from({ length: 4 }, (_, i): Slot => ({ id: "V-" + String(i + 1).padStart(2, "0"), type: "Visitor", flatId: i === 0 ? "B-101" : undefined })),
];

const apartments: Apartment[] = [
  { id: "AP1", name: APARTMENT, city: "Hyderabad", flats: 16, blocks: 2, secretary: "Arvind Menon", phone: "+91 98480 12345", status: "Active", plan: "Premium", renews: "12 Jan 2027" },
  { id: "AP2", name: "Green Meadows", city: "Bengaluru", flats: 120, blocks: 6, secretary: "Shalini Rao", phone: "+91 99000 22110", status: "Active", plan: "Premium", renews: "03 Mar 2027" },
  { id: "AP3", name: "Sunrise Enclave", city: "Pune", flats: 48, blocks: 3, secretary: "Nitin Kulkarni", phone: "+91 98220 33445", status: "Pending", plan: "Trial", renews: "—" },
  { id: "AP4", name: "Palm Heights", city: "Chennai", flats: 64, blocks: 4, secretary: "Revathi S", phone: "+91 94440 55667", status: "Pending", plan: "Trial", renews: "—" },
  { id: "AP5", name: "Riverside Towers", city: "Kochi", flats: 36, blocks: 2, secretary: "Joseph Mathew", phone: "+91 94470 77889", status: "Active", plan: "Free", renews: "—" },
];

const notifications: Notification[] = [
  { id: "NT1", role: "resident", title: "Visitor at the gate", body: "Swiggy delivery is waiting for your approval.", time: "2 min ago", read: false },
  { id: "NT2", role: "resident", title: "Complaint update", body: "C-1042 is now In Progress.", time: "Yesterday", read: false },
  { id: "NT3", role: "resident", title: "Maintenance due", body: "₹3,500 for Nov 2026 was due on 10 Nov.", time: "6 days ago", read: true },
  { id: "NT4", role: "secretary", title: "Payment submitted", body: "B-201 submitted ₹3,500 via UPI.", time: "1 hr ago", read: false },
  { id: "NT5", role: "secretary", title: "Owner registration", body: "Manoj Singh registered for B-302.", time: "3 hr ago", read: false },
  { id: "NT6", role: "secretary", title: "Emergency complaint", body: "Block B lift stuck — C-1041.", time: "Today", read: false },
  { id: "NT7", role: "admin", title: "New apartment registration", body: "Sunrise Enclave, Pune is waiting for approval.", time: "Today", read: false },
  { id: "NT8", role: "admin", title: "New apartment registration", body: "Palm Heights, Chennai is waiting for approval.", time: "Yesterday", read: false },
  { id: "NT9", role: "guard", title: "Pre-approved guest", body: "Ananya Rao is expected for A-302.", time: "30 min ago", read: false },
];

const staff: Staff[] = [
  { id: "S1", name: "Mohan Lal", role: "Security guard", phone: "+91 90001 10001", shift: "6 AM – 2 PM", present: true, salary: 14000 },
  { id: "S2", name: "Iqbal Hussain", role: "Security guard", phone: "+91 90001 10002", shift: "2 PM – 10 PM", present: true, salary: 14000 },
  { id: "S3", name: "Gowri", role: "Housekeeping", phone: "+91 90001 10003", shift: "7 AM – 3 PM", present: false, salary: 11000 },
  { id: "S4", name: "Ramesh", role: "Plumber", phone: "+91 90001 10004", shift: "On call", present: true, salary: 9000 },
  { id: "S5", name: "Venkat", role: "Electrician", phone: "+91 90001 10005", shift: "On call", present: true, salary: 9000 },
];

const uid = (p: string) => p + Math.random().toString(36).slice(2, 7).toUpperCase();
const code6 = () => String(Math.floor(100000 + Math.random() * 900000));

interface State {
  flats: Flat[]; payments: Payment[]; expenses: Expense[]; complaints: Complaint[]; visitors: Visitor[];
  notices: Notice[]; events: EventItem[]; polls: Poll[]; funds: Fund[]; vehicles: Vehicle[]; slots: Slot[];
  parkingReports: ParkingReport[]; apartments: Apartment[]; notifications: Notification[]; staff: Staff[];
  reminders: Reminder[]; categories: string[];
  notify: (role: Role, title: string, body: string) => void;
  markAllRead: (role: Role) => void;
  submitPayment: (p: { flatId: string; amount: number; utr: string; mode: "UPI" | "Bank"; screenshot?: string }) => { ok: boolean; error?: string };
  reviewPayment: (id: string, approve: boolean) => void;
  markCashPaid: (flatId: string, amount: number) => void;
  sendReminders: (flatIds: string[]) => void;
  addExpense: (e: Omit<Expense, "id" | "month">) => void;
  deleteExpense: (id: string) => void;
  addCategory: (c: string) => void;
  updateFlat: (id: string, patch: Partial<Flat>) => void;
  addComplaint: (c: Omit<Complaint, "id" | "date" | "status" | "comments">) => void;
  updateComplaint: (id: string, patch: Partial<Complaint>, comment?: string) => void;
  addVisitor: (v: Omit<Visitor, "id" | "code" | "date" | "status"> & { status?: VisitorStatus }) => Visitor;
  setVisitorStatus: (id: string, status: VisitorStatus) => void;
  addNotice: (n: Omit<Notice, "id" | "date">) => void;
  addEvent: (e: Pick<EventItem, "title" | "date" | "venue" | "description">) => void;
  rsvp: (id: string, r: "Going" | "Maybe" | "No") => void;
  addPoll: (q: string, options: string[], closes: string) => void;
  vote: (id: string, idx: number) => void;
  addFund: (fd: Pick<Fund, "name" | "purpose" | "target" | "perUnit" | "closes">) => void;
  contribute: (id: string, amount: number) => void;
  addVehicle: (v: Omit<Vehicle, "id" | "status">) => void;
  approveVehicle: (id: string) => void;
  removeVehicle: (id: string) => void;
  assignSlot: (slotId: string, flatId?: string) => void;
  reportParking: (r: Omit<ParkingReport, "id" | "status" | "date">) => void;
  resolveParking: (id: string) => void;
  registerApartment: (a: Pick<Apartment, "name" | "city" | "flats" | "blocks" | "secretary" | "phone">) => void;
  setApartmentStatus: (id: string, status: Apartment["status"]) => void;
  toggleStaff: (id: string) => void;
}

export const useDemo = create<State>((set, get) => ({
  flats, payments, expenses, complaints, visitors, notices, events, polls, funds, vehicles, slots,
  parkingReports: [{ id: "WP1", vehicle: "AP 39 HK 2201", flatId: "B-102", description: "Parked in visitor slot V-02 overnight.", status: "Open", date: "16 Nov 2026" }],
  apartments, notifications, staff,
  reminders: [{ id: "R1", flats: 6, time: "11 Nov 2026, 9:00 AM", kind: "Bulk" }],
  categories: EXPENSE_CATEGORIES,

  notify: (role, title, body) =>
    set((s) => ({ notifications: [{ id: uid("NT"), role, title, body, time: "Just now", read: false }, ...s.notifications] })),
  markAllRead: (role) => set((s) => ({ notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) })),

  submitPayment: ({ flatId, amount, utr, mode, screenshot }) => {
    const used = get().payments.filter((p) => p.status !== "Rejected" && p.utr).map((p) => p.utr!);
    if (isDuplicateUtr(utr, used)) return { ok: false, error: "This transaction ID was already submitted." };
    set((s) => ({ payments: [{ id: uid("P"), flatId, amount, mode, utr: utr.trim().toUpperCase(), date: todayLabel(), status: "Pending", month: MONTH, screenshot }, ...s.payments] }));
    get().notify("secretary", "Payment submitted", `${flatId} submitted ₹${amount.toLocaleString("en-IN")} via ${mode}.`);
    return { ok: true };
  },
  reviewPayment: (id, approve) => {
    const p = get().payments.find((x) => x.id === id);
    if (!p) return;
    set((s) => ({
      payments: s.payments.map((x) => (x.id === id ? { ...x, status: approve ? "Approved" : "Rejected" } : x)),
      flats: approve ? s.flats.map((fl) => (fl.id === p.flatId ? { ...fl, paid: fl.paid + p.amount } : fl)) : s.flats,
    }));
    if (p.flatId === ME_FLAT) get().notify("resident", approve ? "Payment approved" : "Payment rejected", `Your ₹${p.amount.toLocaleString("en-IN")} payment was ${approve ? "approved" : "rejected"}.`);
  },
  markCashPaid: (flatId, amount) =>
    set((s) => ({
      payments: [{ id: uid("P"), flatId, amount, mode: "Cash", date: todayLabel(), status: "Approved", month: MONTH }, ...s.payments],
      flats: s.flats.map((fl) => (fl.id === flatId ? { ...fl, paid: fl.paid + amount } : fl)),
    })),
  sendReminders: (ids) => {
    set((s) => ({ reminders: [{ id: uid("R"), flats: ids.length, time: `${todayLabel()}, ${nowTime()}`, kind: ids.length > 1 ? "Bulk" : "Individual" }, ...s.reminders] }));
    if (ids.includes(ME_FLAT)) get().notify("resident", "Maintenance reminder", "Your November maintenance is pending.");
  },
  addExpense: (e) => set((s) => ({ expenses: [{ ...e, id: uid("E"), month: MONTH }, ...s.expenses] })),
  deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
  addCategory: (c) => set((s) => (s.categories.includes(c) ? s : { categories: [...s.categories, c] })),
  updateFlat: (id, patch) => {
    const before = get().flats.find((x) => x.id === id);
    set((s) => ({ flats: s.flats.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    if (patch.reg && before?.reg === "Pending") get().notify("secretary", "Registration " + (patch.reg === "Approved" ? "approved" : "updated"), `${before.owner} · ${id}`);
  },
  addComplaint: (c) => {
    const id = "C-" + (1043 + get().complaints.length);
    set((s) => ({ complaints: [{ ...c, id, date: todayLabel(), status: "Submitted", comments: [] }, ...s.complaints] }));
    get().notify("secretary", "New complaint", `${c.flatId}: ${c.category} (${c.priority})`);
  },
  updateComplaint: (id, patch, comment) => {
    const c = get().complaints.find((x) => x.id === id);
    set((s) => ({ complaints: s.complaints.map((x) => (x.id === id ? { ...x, ...patch, comments: comment ? [...x.comments, comment] : x.comments } : x)) }));
    if (c?.flatId === ME_FLAT && patch.status) get().notify("resident", "Complaint update", `${id} is now ${patch.status}.`);
  },
  addVisitor: (v) => {
    const item: Visitor = { ...v, id: uid("V"), code: code6(), date: "Today", status: v.status ?? "Pending" };
    set((s) => ({ visitors: [item, ...s.visitors] }));
    if (item.status === "Pending" && item.flatId === ME_FLAT) get().notify("resident", "Visitor at the gate", `${item.name} is waiting for your approval.`);
    if (item.status === "Approved") get().notify("guard", "Pre-approved visitor", `${item.name} is expected for ${item.flatId}.`);
    return item;
  },
  setVisitorStatus: (id, status) =>
    set((s) => ({
      visitors: s.visitors.map((v) =>
        v.id === id ? { ...v, status, entry: status === "Inside" ? nowTime() : v.entry, exit: status === "Exited" ? nowTime() : v.exit } : v,
      ),
    })),
  addNotice: (n) => {
    set((s) => ({ notices: [{ ...n, id: uid("N"), date: todayLabel() }, ...s.notices] }));
    get().notify("resident", "New notice", n.title);
  },
  addEvent: (e) => {
    set((s) => ({ events: [{ ...e, id: uid("EV"), going: 0, maybe: 0, no: 0 }, ...s.events] }));
    get().notify("resident", "New event", e.title);
  },
  rsvp: (id, r) =>
    set((s) => ({
      events: s.events.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e };
        const key = (x: "Going" | "Maybe" | "No") => (x === "Going" ? "going" : x === "Maybe" ? "maybe" : "no") as "going" | "maybe" | "no";
        if (e.my) next[key(e.my)] -= 1;
        next[key(r)] += 1;
        next.my = r;
        return next;
      }),
    })),
  addPoll: (question, options, closes) => {
    set((s) => ({ polls: [{ id: uid("PL"), question, options: options.map((label) => ({ label, votes: 0 })), closes }, ...s.polls] }));
    get().notify("resident", "New poll", question);
  },
  vote: (id, idx) =>
    set((s) => ({
      polls: s.polls.map((p) =>
        p.id !== id || p.my !== undefined ? p : { ...p, my: idx, options: p.options.map((o, i) => (i === idx ? { ...o, votes: o.votes + 1 } : o)) },
      ),
    })),
  addFund: (fd) => {
    set((s) => ({ funds: [{ ...fd, id: uid("F"), collected: 0, mine: 0 }, ...s.funds] }));
    get().notify("resident", "New fund", fd.name);
  },
  contribute: (id, amount) => set((s) => ({ funds: s.funds.map((x) => (x.id === id ? { ...x, collected: x.collected + amount, mine: x.mine + amount } : x)) })),
  addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, { ...v, id: uid("VH"), status: "Pending" }] })),
  approveVehicle: (id) => set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, status: "Approved" } : v)) })),
  removeVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),
  assignSlot: (slotId, flatId) => set((s) => ({ slots: s.slots.map((x) => (x.id === slotId ? { ...x, flatId } : x)) })),
  reportParking: (r) => {
    set((s) => ({ parkingReports: [{ ...r, id: uid("WP"), status: "Open", date: todayLabel() }, ...s.parkingReports] }));
    if (r.flatId === ME_FLAT) get().notify("resident", "Wrong parking report", `${r.vehicle}: ${r.description}`);
  },
  resolveParking: (id) => set((s) => ({ parkingReports: s.parkingReports.map((r) => (r.id === id ? { ...r, status: "Resolved" } : r)) })),
  registerApartment: (a) => {
    set((s) => ({ apartments: [{ ...a, id: uid("AP"), status: "Pending", plan: "Trial", renews: "—" }, ...s.apartments] }));
    get().notify("admin", "New apartment registration", `${a.name}, ${a.city} is waiting for approval.`);
  },
  setApartmentStatus: (id, status) => set((s) => ({ apartments: s.apartments.map((a) => (a.id === id ? { ...a, status } : a)) })),
  toggleStaff: (id) => set((s) => ({ staff: s.staff.map((x) => (x.id === id ? { ...x, present: !x.present } : x)) })),
}));

export const flatName = (fl?: Flat) => (fl ? fl.tenant ?? fl.owner : "");
