
const durations = [1, 2, 3, 6, 7, 12, 24];
const streams = [1, 2, 3, 4, 5, 6];
const phone = '212631479723';
const widget = 'https://control.emeraldiptv.irish/widget?site=germany&lang=de';
const monthText = value => `${value} ${value === 1 ? 'Monat' : 'Monate'}`;
const streamText = value => `${value} ${value === 1 ? 'Stream' : 'Streams'}`;
function chat(message) { return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`; }
function quote(months, screens) {
  if (!durations.includes(months) || !streams.includes(screens)) throw new RangeError('Ungültige Tarifauswahl');
  return chat(`Hallo, IPTV Deutschland 8K: ${monthText(months)}, ${streamText(screens)}. Preis in EUR?`);
}
function monthlyCost(total, extra, months, screens) {
  if (![total, extra, months, screens].every(Number.isFinite) || total <= 0 || extra < 0 || !Number.isInteger(months) || months < 1 || !Number.isInteger(screens) || screens < 1) return null;
  const monthly = (total + extra) / months;
  return {monthly, perStream:monthly / screens};
}
export { durations, streams, monthText, streamText, chat, quote, monthlyCost, widget };
