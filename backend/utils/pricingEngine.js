/**
 * Calculates the rental total with dynamic pricing.
 *
 * Returns:
 *   { breakdown, weekendSurcharge, baseTotal, finalTotal }
 *
 * - weekends (Sat/Sun) are charged at vehicle.weekendMultiplier
 * - holidayDates is a Set of 'YYYY-MM-DD' strings (optional)
 */

// Indian public holidays 2025-2026 (extend as needed)
const HOLIDAYS = new Set([
  '2025-01-26', '2025-03-14', '2025-04-14', '2025-04-18',
  '2025-08-15', '2025-10-02', '2025-10-20', '2025-11-05',
  '2025-12-25',
  '2026-01-26', '2026-08-15', '2026-10-02', '2026-12-25',
]);

export function calculateDynamicPrice(startDate, endDate, pricePerDay, weekendMultiplier = 1.0, holidayMultiplier = 1.0) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const days  = Math.max(1, Math.ceil((end - start) / 86400000));

  let baseTotal      = 0;
  let weekendCharge  = 0;
  let holidayCharge  = 0;
  const breakdown    = [];

  for (let i = 0; i < days; i++) {
    const d   = new Date(start);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();               // 0=Sun, 6=Sat
    const key = d.toISOString().slice(0, 10);

    const isWeekend  = dow === 0 || dow === 6;
    const isHoliday  = HOLIDAYS.has(key);

    let multiplier = 1.0;
    let type       = 'weekday';

    if (isHoliday && holidayMultiplier > multiplier) {
      multiplier = holidayMultiplier;
      type       = 'holiday';
    } else if (isWeekend && weekendMultiplier > multiplier) {
      multiplier = weekendMultiplier;
      type       = 'weekend';
    }

    const dayPrice = Math.round(pricePerDay * multiplier);
    const surcharge = dayPrice - pricePerDay;
    baseTotal     += pricePerDay;
    weekendCharge += type === 'weekend' ? surcharge : 0;
    holidayCharge += type === 'holiday' ? surcharge : 0;
    breakdown.push({ date: key, type, multiplier, dayPrice });
  }

  return {
    days,
    baseTotal,
    weekendSurcharge: weekendCharge + holidayCharge,
    finalTotal: baseTotal + weekendCharge + holidayCharge,
    breakdown,
  };
}
