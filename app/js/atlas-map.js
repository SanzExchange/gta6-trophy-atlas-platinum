// Atlas map: a stylised chart of Leonida — six numbered regions, one per roadmap
// stage, joined by the dashed gold route a player travels to the platinum.
export function buildAtlasMap(stages, earned, activeStage) {
  const regions = [
    { id: 1, points: '10,18 78,10 92,44 60,66 22,58', cx: 52, cy: 36, label: 'LANDFALL' },
    { id: 2, points: '96,12 190,8 210,40 168,58 96,46', cx: 152, cy: 30, label: 'VICE CITY' },
    { id: 3, points: '66,70 160,64 176,108 120,128 70,110', cx: 122, cy: 94, label: 'THE CREW' },
    { id: 4, points: '24,72 62,72 66,120 40,158 12,120', cx: 38, cy: 112, label: 'PLAYGROUND' },
    { id: 5, points: '180,66 216,52 244,96 228,150 186,132 178,104', cx: 210, cy: 100, label: 'HEAT' },
    { id: 6, points: '110,138 150,134 158,162 118,168', cx: 134, cy: 150, label: 'CLEANUP' },
  ];
  const route = regions.map((r) => `${r.cx},${r.cy}`).join(' ');
  const parts = ['<svg viewBox="0 0 260 182" role="img" aria-label="Stylised map of Leonida with the six roadmap stages">'];
  parts.push(`<polyline class="map-route" points="${route}"></polyline>`);
  for (const region of regions) {
    const stage = stages.find((s) => s.id === region.id);
    const done = stage.trophies.filter((id) => earned.has(id)).length;
    const allDone = done === stage.trophies.length;
    parts.push(
      `<polygon class="map-region${allDone ? ' done' : ''}${activeStage === region.id ? ' active' : ''}" ` +
      `data-stage="${region.id}" points="${region.points}"></polygon>`,
    );
  }
  for (const region of regions) {
    parts.push(`<text class="map-num" x="${region.cx}" y="${region.cy - 4}">${region.id}</text>`);
    parts.push(`<text class="map-label" x="${region.cx}" y="${region.cy + 10}">${region.label}</text>`);
  }
  parts.push('</svg>');
  return parts.join('');
}
