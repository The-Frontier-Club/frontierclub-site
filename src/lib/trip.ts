// The one hero trip this site is currently built around. A plain constant,
// not a content collection - there's only ever one of these at a time, so a
// whole collection (meant for repeatable items) would be overkill. Import
// this wherever the trip's name/dates/etc. need to appear (currently just
// index.astro) so there's one place to update when the trip changes.
export const trip = {
  name: 'South Africa & Zimbabwe',
  destination: 'South Africa & Zimbabwe',
  dates: 'November 18-28, 2026',
  groupSize: 'Max 12 travelers', // TODO: confirm real group size
  price: '$4,750 USD',
  showPrice: false, // Pricing-visibility decision is still open (see earlier notes)
  overview:
    "11 days. Two countries. No stone left unturned.\n\nLet's discover Cape Town and Zimbabwe together on an action-fuelled journey designed to challenge your perspective on what adventurous travel can truly be. Expect cold-water plunges, real safari and at least one moment that will make you miss home. Not a holiday. An adventure for those ready to step outside their comfort zone, with the small-group energy that turns strangers into people you'd travel with again.",
};
