import { C } from '../lib/format';
import type { FieldAreaStat } from '../types';

// Geographic bounding box for the Philippines SVG (viewBox 0 0 560 660)
const LON_MIN = 116.7;
const LON_MAX = 127.0;
const LAT_MIN = 4.6;
const LAT_MAX = 20.9;

function project(lat: number, lon: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 490 + 45;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 610 + 25;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function polyPath(coords: [number, number][]): string {
  return (
    coords
      .map(([lat, lon], i) => {
        const [x, y] = project(lat, lon);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ') + ' Z'
  );
}

// Simplified accurate geographic outlines of major Philippine islands
const ISLANDS: { name: string; coords: [number, number][] }[] = [
  {
    name: 'Luzon',
    coords: [
      [18.55, 120.75], [18.5, 122.15], [17.7, 122.3], [16.5, 122.25], [15.7, 121.65],
      [14.9, 121.6], [14.3, 121.95], [14.25, 122.75], [13.95, 123.5], [13.55, 124.05],
      [13.0, 124.15], [12.55, 124.05], [12.75, 123.35], [13.45, 123.05], [13.85, 122.25],
      [13.75, 121.4], [13.7, 120.9], [14.1, 120.6], [14.45, 120.95], [14.8, 120.25],
      [15.4, 119.9], [16.15, 119.75], [16.4, 120.25], [17.0, 120.4], [17.6, 120.35],
      [18.25, 120.55],
    ],
  },
  {
    name: 'Mindoro',
    coords: [
      [13.52, 120.95], [13.2, 121.48], [12.45, 121.45], [12.2, 121.1], [12.6, 120.8], [13.25, 120.45],
    ],
  },
  {
    name: 'Palawan',
    coords: [
      [11.45, 119.45], [11.2, 119.65], [10.3, 119.35], [9.4, 118.55], [8.35, 117.25],
      [8.55, 117.1], [9.6, 118.3], [10.6, 119.05],
    ],
  },
  {
    name: 'Panay',
    coords: [
      [11.9, 122.05], [11.55, 123.1], [10.9, 122.95], [10.45, 122.05], [11.15, 122.0],
    ],
  },
  {
    name: 'Negros',
    coords: [
      [10.95, 123.15], [10.85, 123.55], [9.9, 123.25], [9.05, 123.1], [9.25, 122.55], [10.2, 122.85],
    ],
  },
  {
    name: 'Cebu',
    coords: [
      [11.25, 124.05], [10.5, 124.02], [9.45, 123.35], [9.65, 123.3], [10.55, 123.75], [11.15, 123.9],
    ],
  },
  {
    name: 'Bohol',
    coords: [
      [10.15, 124.2], [9.95, 124.55], [9.55, 124.3], [9.6, 123.8], [9.95, 123.95],
    ],
  },
  {
    name: 'Samar',
    coords: [
      [12.55, 124.35], [12.35, 125.3], [11.3, 125.65], [11.05, 125.15], [11.7, 124.85], [12.2, 124.3],
    ],
  },
  {
    name: 'Leyte',
    coords: [
      [11.55, 124.35], [11.35, 124.95], [10.15, 125.2], [10.05, 124.8], [10.75, 124.65],
    ],
  },
  {
    name: 'Mindanao',
    coords: [
      [9.75, 125.5], [9.25, 126.2], [7.9, 126.45], [6.3, 126.2], [6.95, 125.6],
      [6.1, 125.25], [5.6, 125.4], [6.1, 124.35], [7.15, 124.15], [7.8, 123.45],
      [7.35, 122.8], [6.9, 122.05], [7.5, 122.15], [8.15, 122.95], [8.65, 123.35],
      [8.2, 124.15], [8.55, 124.65], [9.0, 125.45],
    ],
  },
];

// Real GPS coordinates (lat, lon) for Philippine provinces & NCR zones
const AREA_COORDS: Record<string, { lat: number; lon: number; ncr?: [number, number] }> = {
  'ILOCOS NORTE': { lat: 18.16, lon: 120.59 },
  'ILOCOS SUR': { lat: 17.57, lon: 120.39 },
  'LA UNION': { lat: 16.61, lon: 120.32 },
  PANGASINAN: { lat: 15.92, lon: 120.33 },
  BAGUIO: { lat: 16.4, lon: 120.6 },
  BENGUET: { lat: 16.45, lon: 120.65 },
  CAGAYAN: { lat: 17.61, lon: 121.73 },
  ISABELA: { lat: 16.98, lon: 121.81 },
  'NUEVA ECIJA': { lat: 15.58, lon: 120.97 },
  TARLAC: { lat: 15.48, lon: 120.59 },
  PAMPANGA: { lat: 15.08, lon: 120.62 },
  ZAMBALES: { lat: 15.32, lon: 119.98 },
  BATAAN: { lat: 14.64, lon: 120.48 },
  BULACAN: { lat: 14.85, lon: 120.88, ncr: [70, 28] },
  CAMANAVA: { lat: 14.66, lon: 120.97, ncr: [52, 62] },
  NORTH: { lat: 14.72, lon: 121.04, ncr: [82, 54] },
  'QUEZON CITY': { lat: 14.67, lon: 121.04, ncr: [88, 72] },
  QC: { lat: 14.67, lon: 121.04, ncr: [88, 72] },
  MANILA: { lat: 14.59, lon: 120.98, ncr: [56, 86] },
  'PASIG/MARIKINA': { lat: 14.61, lon: 121.09, ncr: [118, 82] },
  PASIG: { lat: 14.58, lon: 121.08, ncr: [114, 88] },
  MARIKINA: { lat: 14.65, lon: 121.1, ncr: [122, 72] },
  RIZAL: { lat: 14.6, lon: 121.2, ncr: [135, 86] },
  SOUTH: { lat: 14.43, lon: 121.02, ncr: [82, 118] },
  MAKATI: { lat: 14.55, lon: 121.02, ncr: [82, 96] },
  TAGUIG: { lat: 14.52, lon: 121.07, ncr: [104, 104] },
  PARANAQUE: { lat: 14.47, lon: 121.01, ncr: [76, 114] },
  'LAS PINAS': { lat: 14.45, lon: 120.98, ncr: [62, 120] },
  MUNTINLUPA: { lat: 14.41, lon: 121.04, ncr: [92, 126] },
  CAVITE: { lat: 14.32, lon: 120.92, ncr: [44, 134] },
  LAGUNA: { lat: 14.23, lon: 121.25 },
  BATANGAS: { lat: 13.76, lon: 121.06 },
  'QUEZON PROVINCE': { lat: 13.94, lon: 121.75 },
  QUEZON: { lat: 13.94, lon: 121.75 },
  'ORIENTAL MINDORO': { lat: 13.05, lon: 121.4 },
  'OCCIDENTAL MINDORO': { lat: 13.1, lon: 120.75 },
  PALAWAN: { lat: 9.84, lon: 118.74 },
  CAMNORTE: { lat: 14.12, lon: 122.85 },
  'CAMARINES NORTE': { lat: 14.12, lon: 122.85 },
  CAMSUR: { lat: 13.62, lon: 123.35 },
  'CAMARINES SUR': { lat: 13.62, lon: 123.35 },
  ALBAY: { lat: 13.15, lon: 123.73 },
  SORSOGON: { lat: 12.97, lon: 124.0 },
  ILOILO: { lat: 10.72, lon: 122.56 },
  CAPIZ: { lat: 11.55, lon: 122.75 },
  AKLAN: { lat: 11.71, lon: 122.36 },
  ANTIQUE: { lat: 11.15, lon: 122.05 },
  BACOLOD: { lat: 10.67, lon: 122.95 },
  'NEGROS OCCIDENTAL': { lat: 10.4, lon: 122.95 },
  DUMAGUETE: { lat: 9.31, lon: 123.31 },
  'NEGROS ORIENTAL': { lat: 9.55, lon: 123.15 },
  CEBU: { lat: 10.31, lon: 123.89 },
  BOHOL: { lat: 9.85, lon: 124.14 },
  LEYTE: { lat: 10.86, lon: 124.85 },
  TACLOBAN: { lat: 11.24, lon: 125.0 },
  SAMAR: { lat: 11.75, lon: 125.0 },
  'ZAMBOANGA DEL NORTE': { lat: 8.45, lon: 123.25 },
  'ZAMBOANGA DEL SUR': { lat: 7.83, lon: 123.43 },
  ZAMBOANGA: { lat: 6.92, lon: 122.08 },
  CDO: { lat: 8.45, lon: 124.63 },
  'CAGAYAN DE ORO': { lat: 8.45, lon: 124.63 },
  'MISAMIS ORIENTAL': { lat: 8.5, lon: 124.75 },
  BUTUAN: { lat: 8.95, lon: 125.54 },
  'DAVAO DEL NORTE': { lat: 7.45, lon: 125.81 },
  DAVAO: { lat: 7.07, lon: 125.61 },
  'DAVAO DEL SUR': { lat: 6.75, lon: 125.35 },
  'GENERAL SANTOS': { lat: 6.11, lon: 125.17 },
  GENSAN: { lat: 6.11, lon: 125.17 },
  'SOUTH COTABATO': { lat: 6.3, lon: 124.85 },
};

function findCoord(area: string) {
  const key = area.trim().toUpperCase();
  if (AREA_COORDS[key]) return AREA_COORDS[key];
  const partial = Object.keys(AREA_COORDS).find((k) => key.includes(k) || k.includes(key));
  return partial ? AREA_COORDS[partial] : null;
}

function pinColor(a: FieldAreaStat): string {
  if (a.positive === 0) return C.red;
  if (a.neg === 0) return C.green;
  if (a.positive >= a.neg) return C.lime;
  return C.amber;
}

export function PhilippinesMap({ areas }: { areas: FieldAreaStat[] }) {
  const mapped = areas
    .map((a) => ({ ...a, coord: findCoord(a.area) }))
    .filter((a): a is FieldAreaStat & { coord: NonNullable<ReturnType<typeof findCoord>> } => Boolean(a.coord));

  const mainPins = mapped.filter((m) => !m.coord.ncr);
  const ncrPins = mapped.filter((m) => Boolean(m.coord.ncr));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
      <svg
        viewBox="0 0 560 660"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id="ph-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(169,178,255,0.14)" />
            <stop offset="100%" stopColor="rgba(5,5,7,0)" />
          </radialGradient>
          <filter id="pin-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* Subtle ambient radial glow behind archipelago */}
        <circle cx="290" cy="330" r="260" fill="url(#ph-glow)" />

        {/* Subtle lat/lon grid */}
        {[120, 240, 360, 480].map((x) => (
          <line key={`vx-${x}`} x1={x} y1={15} x2={x} y2={645} stroke="rgba(255,255,255,0.035)" strokeDasharray="3 6" />
        ))}
        {[120, 240, 360, 480, 600].map((y) => (
          <line key={`hy-${y}`} x1={15} y1={y} x2={545} y2={y} stroke="rgba(255,255,255,0.035)" strokeDasharray="3 6" />
        ))}

        {/* Philippines Islands */}
        <g>
          {ISLANDS.map((isl) => (
            <path
              key={isl.name}
              d={polyPath(isl.coords)}
              fill="rgba(255, 255, 255, 0.065)"
              stroke="rgba(169, 178, 255, 0.34)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Connector line from Metro Manila to NCR Zoom Inset */}
        {(() => {
          const [mx, my] = project(14.58, 121.02);
          return (
            <g>
              <circle cx={mx} cy={my} r={5} fill="none" stroke={C.violet} strokeWidth="1.2" strokeDasharray="2 2" />
              <line
                x1={182}
                y1={165}
                x2={mx}
                y2={my}
                stroke="rgba(169, 178, 255, 0.45)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            </g>
          );
        })()}

        {/* NCR / Mega Manila Inset Box (Top-Left) */}
        <g transform="translate(12, 22)">
          <rect
            x="0"
            y="0"
            width="170"
            height="152"
            rx="14"
            fill="rgba(12, 14, 20, 0.9)"
            stroke="rgba(169, 178, 255, 0.32)"
            strokeWidth="1.2"
          />
          <text
            x="12"
            y="18"
            fill={C.violet}
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="0.1em"
            fontFamily="var(--font-mono)"
          >
            NCR / GREATER MANILA
          </text>
          {/* Subtle Manila Bay shoreline curve inside inset */}
          <path
            d="M 18,45 Q 48,72 42,115 L 48,142 L 156,142 L 156,28 L 35,28 Z"
            fill="rgba(255,255,255,0.035)"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />

          {ncrPins.map((a) => {
            const [ix, iy] = a.coord.ncr!;
            const col = pinColor(a);
            const r = Math.min(10, 5 + a.total * 1.1);
            return (
              <g key={a.area} filter="url(#pin-shadow)">
                <circle cx={ix} cy={iy} r={r + 5} fill={col} opacity={0.18} className="tv-live-dot" />
                <circle cx={ix} cy={iy} r={r} fill={col} stroke="#050507" strokeWidth="1.5" />
                <text
                  x={ix}
                  y={iy + 3}
                  textAnchor="middle"
                  fill="#050507"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {a.total}
                </text>
                <text
                  x={ix + (ix > 95 ? -r - 4 : r + 5)}
                  y={iy + 3}
                  textAnchor={ix > 95 ? 'end' : 'start'}
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {a.area} ({a.positive}/{a.total})
                </text>
              </g>
            );
          })}
        </g>

        {/* Provincial Area Pins across Luzon, Visayas, Mindanao */}
        {mainPins.map((a) => {
          const [px, py] = project(a.coord.lat, a.coord.lon);
          const col = pinColor(a);
          const r = Math.min(13, 5.5 + a.total * 1.1);
          const labelRight = a.coord.lon >= 122.4 || a.area === 'LA UNION' || a.area === 'ORIENTAL MINDORO';
          return (
            <g key={a.area} filter="url(#pin-shadow)">
              <circle cx={px} cy={py} r={r + 6} fill={col} opacity={0.18} className="tv-live-dot" />
              <circle cx={px} cy={py} r={r} fill={col} stroke="#050507" strokeWidth="1.8" />
              <text
                x={px}
                y={py + 3.2}
                textAnchor="middle"
                fill="#050507"
                fontSize="9"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                {a.total}
              </text>
              <g transform={`translate(${px + (labelRight ? r + 6 : -r - 6)}, ${py - 8})`}>
                <rect
                  x={labelRight ? 0 : -118}
                  y="0"
                  width="118"
                  height="17"
                  rx="5"
                  fill="rgba(8, 10, 15, 0.86)"
                  stroke={col}
                  strokeOpacity="0.45"
                  strokeWidth="0.9"
                />
                <text
                  x={labelRight ? 6 : -6}
                  y="11.5"
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill="#FFFFFF"
                  fontSize="8.2"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {a.area.length > 13 ? a.area.slice(0, 12) + '…' : a.area} {a.positive}/{a.total}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Bottom-Left Map Legend */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          bottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 12px',
          borderRadius: 999,
          background: 'rgba(10, 12, 18, 0.85)',
          border: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(9px, 0.68vw, 12px)',
          color: 'var(--t2)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
          All Positive
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: C.lime, display: 'inline-block' }} />
          Mostly Positive
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: C.amber, display: 'inline-block' }} />
          Mixed
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, display: 'inline-block' }} />
          Negative
        </span>
      </div>
    </div>
  );
}
