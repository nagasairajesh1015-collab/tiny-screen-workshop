export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const nowTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
