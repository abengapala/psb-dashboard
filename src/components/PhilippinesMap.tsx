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

// Detailed geographic outlines of the Philippine archipelago
const ISLANDS: { name: string; coords: [number, number][] }[] = [
  {
    name: 'Luzon',
    coords: [
      [18.62, 120.85], [18.55, 121.35], [18.35, 122.12], [17.9, 122.22], [17.35, 122.36],
      [16.65, 122.3], [16.15, 122.02], [15.78, 121.62], [15.25, 121.48], [14.85, 121.62],
      [14.42, 121.7], [14.22, 122.25], [14.32, 122.75], [14.08, 123.02], [13.95, 123.58],
      [13.78, 123.95], [13.38, 123.92], [13.02, 124.16], [12.55, 124.08], [12.58, 123.72],
      [12.92, 123.38], [13.35, 123.28], [13.68, 122.92], [13.28, 122.58], [13.75, 122.22],
      [13.92, 121.65], [13.72, 121.4], [13.64, 120.95], [13.98, 120.62], [14.25, 120.68],
      [14.48, 120.96], [14.62, 120.96], [14.76, 120.52], [14.42, 120.48], [14.78, 120.24],
      [15.32, 119.9], [15.98, 119.78], [16.32, 119.92], [16.08, 120.22], [16.58, 120.32],
      [17.12, 120.42], [17.58, 120.36], [18.08, 120.48], [18.45, 120.58],
    ],
  },
  {
    name: 'Catanduanes',
    coords: [[14.08, 124.22], [13.92, 124.42], [13.55, 124.35], [13.6, 124.08], [13.95, 124.08]],
  },
  {
    name: 'Mindoro',
    coords: [
      [13.52, 120.95], [13.28, 121.42], [12.78, 121.52], [12.22, 121.35],
      [12.22, 120.98], [12.68, 120.75], [13.25, 120.45],
    ],
  },
  {
    name: 'Masbate',
    coords: [[12.55, 123.22], [12.2, 123.92], [11.82, 124.05], [11.95, 123.58], [12.28, 123.22]],
  },
  {
    name: 'Palawan',
    coords: [
      [11.48, 119.45], [11.15, 119.62], [10.65, 119.48], [10.12, 119.22],
      [9.55, 118.68], [8.95, 118.02], [8.35, 117.24], [8.62, 117.08],
      [9.25, 117.88], [9.95, 118.55], [10.68, 119.12],
    ],
  },
  {
    name: 'Panay',
    coords: [
      [11.92, 121.95], [11.68, 122.45], [11.55, 123.12], [11.12, 123.08],
      [10.68, 122.58], [10.42, 122.02], [11.05, 121.98], [11.52, 122.02],
    ],
  },
  {
    name: 'Negros',
    coords: [
      [10.98, 123.12], [10.88, 123.52], [10.35, 123.38], [9.65, 123.18],
      [9.04, 123.08], [9.18, 122.52], [9.85, 122.42], [10.45, 122.82],
    ],
  },
  {
    name: 'Cebu',
    coords: [
      [11.28, 124.02], [10.85, 124.04], [10.32, 123.96], [9.72, 123.56],
      [9.42, 123.34], [9.62, 123.28], [10.22, 123.62], [10.82, 123.84], [11.15, 123.9],
    ],
  },
  {
    name: 'Bohol',
    coords: [
      [10.16, 124.18], [9.96, 124.58], [9.6, 124.38], [9.56, 123.82], [9.92, 123.88],
    ],
  },
  {
    name: 'Samar',
    coords: [
      [12.58, 124.35], [12.48, 125.12], [12.15, 125.48], [11.55, 125.55],
      [11.02, 125.72], [11.12, 125.15], [11.65, 124.82], [12.15, 124.32],
    ],
  },
  {
    name: 'Leyte',
    coords: [
      [11.58, 124.34], [11.42, 124.92], [10.85, 125.02], [10.12, 125.22],
      [10.02, 124.82], [10.55, 124.75], [11.08, 124.42],
    ],
  },
  {
    name: 'Mindanao',
    coords: [
      [9.82, 125.48], [9.48, 125.95], [9.05, 126.25], [8.35, 126.38], [7.65, 126.58],
      [6.85, 126.28], [6.28, 126.2], [6.95, 125.68], [6.55, 125.42], [5.85, 125.62],
      [5.56, 125.35], [6.08, 124.45], [6.75, 123.95], [7.25, 124.22], [7.55, 123.75],
      [7.78, 123.42], [7.35, 122.85], [6.88, 122.05], [7.45, 122.08], [8.05, 122.65],
      [8.58, 123.35], [8.62, 123.78], [8.2, 124.18], [8.48, 124.65], [8.98, 125.45],
    ],
  },
];

// Real GPS coordinates (lat, lon) + label side overrides to prevent overlap
const AREA_COORDS: Record<
  string,
  { lat: number; lon: number; ncr?: [number, number]; labelRight?: boolean }
> = {
  'ILOCOS NORTE': { lat: 18.16, lon: 120.59, labelRight: true },
  'ILOCOS SUR': { lat: 17.57, lon: 120.39, labelRight: false },
  'LA UNION': { lat: 16.61, lon: 120.32, labelRight: true },
  PANGASINAN: { lat: 15.92, lon: 120.33, labelRight: false },
  BAGUIO: { lat: 16.4, lon: 120.6, labelRight: true },
  BENGUET: { lat: 16.45, lon: 120.65, labelRight: true },
  CAGAYAN: { lat: 17.61, lon: 121.73, labelRight: true },
  ISABELA: { lat: 16.98, lon: 121.81, labelRight: true },
  'NUEVA ECIJA': { lat: 15.58, lon: 120.97, labelRight: true },
  TARLAC: { lat: 15.48, lon: 120.59, labelRight: false },
  PAMPANGA: { lat: 15.08, lon: 120.62, labelRight: false },
  ZAMBALES: { lat: 15.32, lon: 119.98, labelRight: false },
  BATAAN: { lat: 14.64, lon: 120.48, labelRight: false },
  BULACAN: { lat: 14.85, lon: 120.88, ncr: [32, 42] },
  CAMANAVA: { lat: 14.66, lon: 120.97, ncr: [26, 70] },
  NORTH: { lat: 14.72, lon: 121.04, ncr: [58, 56] },
  'QUEZON CITY': { lat: 14.67, lon: 121.04, ncr: [56, 78] },
  QC: { lat: 14.67, lon: 121.04, ncr: [56, 78] },
  MANILA: { lat: 14.59, lon: 120.98, ncr: [30, 92] },
  'PASIG/MARIKINA': { lat: 14.61, lon: 121.09, ncr: [44, 100] },
  PASIG: { lat: 14.58, lon: 121.08, ncr: [44, 100] },
  MARIKINA: { lat: 14.65, lon: 121.1, ncr: [44, 100] },
  RIZAL: { lat: 14.6, lon: 121.2, ncr: [64, 106] },
  SOUTH: { lat: 14.43, lon: 121.02, ncr: [34, 130] },
  MAKATI: { lat: 14.55, lon: 121.02, ncr: [46, 114] },
  TAGUIG: { lat: 14.52, lon: 121.07, ncr: [54, 118] },
  PARANAQUE: { lat: 14.47, lon: 121.01, ncr: [34, 126] },
  'LAS PINAS': { lat: 14.45, lon: 120.98, ncr: [28, 134] },
  MUNTINLUPA: { lat: 14.41, lon: 121.04, ncr: [40, 140] },
  CAVITE: { lat: 14.32, lon: 120.92, ncr: [22, 144] },
  LAGUNA: { lat: 14.23, lon: 121.25, labelRight: false },
  BATANGAS: { lat: 13.76, lon: 121.06, labelRight: false },
  'QUEZON PROVINCE': { lat: 13.94, lon: 121.75, labelRight: false },
  QUEZON: { lat: 13.94, lon: 121.75, labelRight: false },
  'ORIENTAL MINDORO': { lat: 13.05, lon: 121.4, labelRight: true },
  'OCCIDENTAL MINDORO': { lat: 13.1, lon: 120.75, labelRight: false },
  PALAWAN: { lat: 9.84, lon: 118.74, labelRight: false },
  CAMNORTE: { lat: 14.12, lon: 122.85, labelRight: true },
  'CAMARINES NORTE': { lat: 14.12, lon: 122.85, labelRight: true },
  CAMSUR: { lat: 13.62, lon: 123.35, labelRight: true },
  'CAMARINES SUR': { lat: 13.62, lon: 123.35, labelRight: true },
  ALBAY: { lat: 13.15, lon: 123.73, labelRight: true },
  SORSOGON: { lat: 12.97, lon: 124.0, labelRight: true },
  ILOILO: { lat: 10.72, lon: 122.56, labelRight: false },
  CAPIZ: { lat: 11.55, lon: 122.75, labelRight: false },
  AKLAN: { lat: 11.71, lon: 122.36, labelRight: false },
  ANTIQUE: { lat: 11.15, lon: 122.05, labelRight: false },
  BACOLOD: { lat: 10.67, lon: 122.95, labelRight: true },
  'NEGROS OCCIDENTAL': { lat: 10.4, lon: 122.95, labelRight: true },
  DUMAGUETE: { lat: 9.31, lon: 123.31, labelRight: false },
  'NEGROS ORIENTAL': { lat: 9.55, lon: 123.15, labelRight: false },
  CEBU: { lat: 10.31, lon: 123.89, labelRight: true },
  BOHOL: { lat: 9.85, lon: 124.14, labelRight: true },
  LEYTE: { lat: 10.86, lon: 124.85, labelRight: true },
  TACLOBAN: { lat: 11.24, lon: 125.0, labelRight: true },
  SAMAR: { lat: 11.75, lon: 125.0, labelRight: true },
  'ZAMBOANGA DEL NORTE': { lat: 8.45, lon: 123.25, labelRight: false },
  'ZAMBOANGA DEL SUR': { lat: 7.83, lon: 123.43, labelRight: false },
  ZAMBOANGA: { lat: 6.92, lon: 122.08, labelRight: false },
  CDO: { lat: 8.45, lon: 124.63, labelRight: true },
  'CAGAYAN DE ORO': { lat: 8.45, lon: 124.63, labelRight: true },
  'MISAMIS ORIENTAL': { lat: 8.5, lon: 124.75, labelRight: true },
  BUTUAN: { lat: 8.95, lon: 125.54, labelRight: true },
  'DAVAO DEL NORTE': { lat: 7.45, lon: 125.81, labelRight: true },
  DAVAO: { lat: 7.07, lon: 125.61, labelRight: true },
  'DAVAO DEL SUR': { lat: 6.75, lon: 125.35, labelRight: true },
  'GENERAL SANTOS': { lat: 6.11, lon: 125.17, labelRight: true },
  GENSAN: { lat: 6.11, lon: 125.17, labelRight: true },
  'SOUTH COTABATO': { lat: 6.3, lon: 124.85, labelRight: false },
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
              stroke="rgba(169, 178, 255, 0.36)"
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
                x1={206}
                y1={168}
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
        <g transform="translate(10, 18)">
          <rect
            x="0"
            y="0"
            width="196"
            height="156"
            rx="14"
            fill="rgba(12, 14, 20, 0.92)"
            stroke="rgba(169, 178, 255, 0.34)"
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

          {ncrPins.map((a) => {
            const [ix, iy] = a.coord.ncr!;
            const col = pinColor(a);
            const r = Math.min(9.5, 5.5 + a.total * 0.9);
            return (
              <g key={a.area} filter="url(#pin-shadow)">
                <circle cx={ix} cy={iy} r={r + 5} fill={col} opacity={0.22}>
                  <animate attributeName="r" values={`${r + 3};${r + 7};${r + 3}`} dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.28;0.08;0.28" dur="2.2s" repeatCount="indefinite" />
                </circle>
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
                  x={ix + r + 8}
                  y={iy + 3}
                  textAnchor="start"
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
          const r = Math.min(12.5, 5.5 + a.total * 1.1);
          const labelRight = a.coord.labelRight ?? a.coord.lon >= 122.4;
          const labelText = `${a.area.length > 14 ? a.area.slice(0, 13) + '…' : a.area} ${a.positive}/${a.total}`;
          const boxW = Math.max(82, labelText.length * 5.6 + 14);
          return (
            <g key={a.area} filter="url(#pin-shadow)">
              <circle cx={px} cy={py} r={r + 6} fill={col} opacity={0.22}>
                <animate attributeName="r" values={`${r + 3};${r + 9};${r + 3}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2.4s" repeatCount="indefinite" />
              </circle>
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
              <g transform={`translate(${px + (labelRight ? r + 6 : -r - 6)}, ${py - 8.5})`}>
                <rect
                  x={labelRight ? 0 : -boxW}
                  y="0"
                  width={boxW}
                  height="17"
                  rx="5"
                  fill="rgba(8, 10, 15, 0.88)"
                  stroke={col}
                  strokeOpacity="0.5"
                  strokeWidth="0.9"
                />
                <text
                  x={labelRight ? 7 : -7}
                  y="11.5"
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill="#FFFFFF"
                  fontSize="8.3"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {labelText}
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
