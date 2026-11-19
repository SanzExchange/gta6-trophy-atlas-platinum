// Atlas chart for the rebuild: a stylised map of Leonida drawn as SVG — six
// numbered landfalls joined by the dashed gold route to the platinum.
const LANDMARKS = [
  { x: 42, y: 118 }, { x: 96, y: 74 }, { x: 152, y: 104 },
  { x: 196, y: 52 }, { x: 238, y: 96 }, { x: 268, y: 40 },
];

export function buildAtlasMap(stages, earned, activeStage) {
  const route = LANDMARKS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const marks = stages.map((stage, i) => {
    const p = LANDMARKS[i];
    const done = stage.ids.every((id) => earned.has(id));
    const fill = done ? '#c9a227' : (activeStage === stage.key ? '#e3c766' : '#16281f');
    const label = done ? '#1c1503' : '#efe6cf';
    return `<g><circle cx="${p.x}" cy="${p.y}" r="13" fill="${fill}" stroke="#c9a227" stroke-width="1.6"/><text x="${p.x}" y="${p.y + 4.5}" text-anchor="middle" font-size="11.5" font-family="Georgia, serif" fill="${label}">${stage.key}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 300 150" role="img" aria-label="Stylised chart of Leonida with the six roadmap stages">
    <path d="M8,132 C60,96 84,140 138,116 C190,94 226,128 292,86 L292,150 L8,150 Z" fill="#0e2019"/>
    <path d="M8,26 C70,8 150,30 292,14" fill="none" stroke="#2c4636" stroke-width="1" stroke-dasharray="3 4"/>
    <path d="${route}" fill="none" stroke="#c9a227" stroke-width="2" stroke-dasharray="6 4"/>
    ${marks}
    <text x="10" y="18" font-size="9.5" letter-spacing="2" fill="#a9b8a4" font-family="Georgia, serif">LEONIDA — SURVEY OF THE PLATINUM ROUTE</text>
  </svg>`;
}
