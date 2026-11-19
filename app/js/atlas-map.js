// Atlas chart — Atlas Platinum Leonida (retry build).
// A stylised survey chart of Leonida drawn as inline SVG: six numbered
// landfalls (the roadmap stages) joined by the dashed gold route that ends
// at the platinum meridian. A landfall fills with gold once every trophy of
// its stage is earned. Original drawing — no game artwork of any kind.
const LANDFALL_POINTS = [
  { x: 36, y: 112 }, { x: 92, y: 66 }, { x: 148, y: 100 },
  { x: 198, y: 48 }, { x: 240, y: 92 }, { x: 272, y: 36 },
];

export function buildAtlasMap(stages, earned, activeStageKey) {
  const routePath = LANDFALL_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const marks = stages.map((stage, i) => {
    const point = LANDFALL_POINTS[i];
    const complete = stage.ids.every((id) => earned.has(id));
    const fill = complete ? '#c9a227' : (activeStageKey === stage.key ? '#e3c766' : '#16281f');
    const ink = complete || activeStageKey === stage.key ? '#1c1503' : '#efe6cf';
    return `<g><circle cx="${point.x}" cy="${point.y}" r="13" fill="${fill}" stroke="#c9a227" stroke-width="1.6"/><text x="${point.x}" y="${point.y + 4.5}" text-anchor="middle" font-size="11.5" font-family="Georgia, 'Times New Roman', serif" fill="${ink}">${stage.key}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 300 150" role="img" aria-label="Stylised survey chart of Leonida showing the six roadmap stages">
    <path d="M6,134 C58,98 86,142 140,118 C192,96 228,130 294,88 L294,150 L6,150 Z" fill="#0e2019"/>
    <path d="M6,24 C72,6 152,28 294,12" fill="none" stroke="#2c4636" stroke-width="1" stroke-dasharray="3 4"/>
    <path d="M6,88 C90,80 200,86 294,70" fill="none" stroke="#22392c" stroke-width="1" stroke-dasharray="2 5"/>
    <path d="${routePath}" fill="none" stroke="#c9a227" stroke-width="2" stroke-dasharray="6 4"/>
    ${marks}
    <text x="10" y="17" font-size="9.5" letter-spacing="2" fill="#a9b8a4" font-family="Georgia, 'Times New Roman', serif">LEONIDA — SURVEY OF THE PLATINUM ROUTE</text>
    <text x="238" y="146" font-size="8.5" letter-spacing="1.5" fill="#7d8f78" font-family="Georgia, 'Times New Roman', serif">✦ PLATINUM</text>
  </svg>`;
}
