// Formatting helpers for Deal Radar: money, discounts and the honest
// "is it really a deal" verdict labels. One job only: turn deal numbers
// into the strings the views show. Discounts are always computed from
// price and was here — no discount percentage is ever typed by hand, so
// the % off on a card can never disagree with its two prices.

export function usd(n) {
  const v = Number(n);
  const text = v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${text.replace(/\.00$/, "")}`;
}

export function percentOff(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function saved(d) {
  return d.was - d.price;
}

export function checkDay(iso) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";
}

const VERDICTS = {
  "new-low": { label: "NEW LOW", hint: "Lowest price any source has reported for this product." },
  strong: { label: "STRONG DEAL", hint: "A deep cut on a real usual price — worth buying now." },
  routine: { label: "ROUTINE SALE", hint: "A real saving, but this price recurs every sale season." },
};

export function verdictLabel(v) {
  return (VERDICTS[v] || VERDICTS.routine).label;
}

export function verdictHint(v) {
  return (VERDICTS[v] || VERDICTS.routine).hint;
}
