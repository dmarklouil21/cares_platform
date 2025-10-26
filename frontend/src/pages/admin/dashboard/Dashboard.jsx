import React, { useMemo, useState, useRef, useEffect } from "react";
import api from "src/api/axiosInstance";

const usePrefersReducedMotion = () => {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return prefers;
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const hexToRgba = (hex, a = 1) => {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const useMountProgress = (duration = 900) => {
  const prefers = usePrefersReducedMotion();
  const [p, setP] = useState(prefers ? 1 : 0);
  useEffect(() => {
    if (prefers) {
      setP(1);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setP(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefers, duration]);
  return p;
};

const GradientAreaChart = ({
  data,
  height = 280,
  padding = { top: 24, right: 16, bottom: 36, left: 44 },
  lineColor = "#2563EB",
  areaStartOpacity = 0.25,
  areaEndOpacity = 0.0,
  gridColor = "#EEF2F7",
  labelColor = "#6B7280",
  backgroundFill = "transparent",
  drawDuration = 1200,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [hoverIdx, setHoverIdx] = useState(null);
  const width = 960;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { maxValue, points, yTicks } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 0);
    const pow10 = Math.pow(10, Math.max(0, String(Math.floor(max)).length - 1));
    const niceMax = Math.ceil(max / pow10) * pow10 || 10;
    const xStep = chartW / Math.max(1, data.length - 1);
    const yScale = (v) => chartH - (v / niceMax) * chartH;
    const pts = data.map((d, i) => [
      padding.left + i * xStep,
      padding.top + yScale(d.value),
    ]);
    const ticks = Array.from({ length: 5 }, (_, i) =>
      Math.round((niceMax / 4) * i)
    );
    return { maxValue: niceMax, points: pts, yTicks: ticks };
  }, [data, chartW, chartH, padding.left, padding.top]);

  const areaPath = useMemo(() => {
    if (!points.length) return "";
    const top = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
      .join(" ");
    const base = `L ${points[points.length - 1][0]} ${padding.top + chartH} L ${
      points[0][0]
    } ${padding.top + chartH} Z`;
    return `${top} ${base}`;
  }, [points, padding.top, chartH]);

  const linePath = useMemo(() => {
    if (!points.length) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
      .join(" ");
  }, [points]);

  const xFromIdx = (i) => points[i]?.[0] ?? 0;
  const yFromIdx = (i) => points[i]?.[1] ?? 0;

  const nearestIdx = (mx) => {
    let best = 0,
      bestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p[0] - mx);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const pathRef = useRef(null);
  const [lineLen, setLineLen] = useState(0);
  const [progress, setProgress] = useState(prefersReducedMotion ? 1 : 0);
  const marker = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!pathRef.current) return;
    const L = pathRef.current.getTotalLength?.() ?? 0;
    setLineLen(L);
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / drawDuration);
      const e = easeOutCubic(t);
      setProgress(e);
      if (pathRef.current && L > 0) {
        const pt = pathRef.current.getPointAtLength(L * e);
        marker.current = { x: pt.x, y: pt.y };
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [linePath, prefersReducedMotion, drawDuration]);

  return (
    <div className="w-full">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[720px]"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mx = ((e.clientX - rect.left) / rect.width) * width;
            setHoverIdx(nearestIdx(mx));
          }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopOpacity={areaStartOpacity}
                stopColor={lineColor}
              />
              <stop
                offset="100%"
                stopOpacity={areaEndOpacity}
                stopColor={lineColor}
              />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill={backgroundFill}
          />

          {yTicks.map((t, i) => {
            const y = padding.top + (chartH - (t / maxValue) * chartH);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke={gridColor}
                />
                <text
                  x={padding.left - 8}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize="10"
                  fill={labelColor}
                >
                  {t.toLocaleString()}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#areaGradient)" />

          <path
            ref={pathRef}
            d={linePath}
            stroke={lineColor}
            strokeWidth="2.5"
            fill="none"
            filter="url(#glow)"
            style={{
              strokeDasharray: lineLen || 1,
              strokeDashoffset: lineLen > 0 ? (1 - progress) * lineLen : 0,
            }}
          />

          {progress < 1 && lineLen > 0 && (
            <circle
              cx={marker.current.x}
              cy={marker.current.y}
              r="4"
              fill={lineColor}
            />
          )}

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={hoverIdx === i ? 4 : 0}
              fill={lineColor}
            />
          ))}

          {hoverIdx !== null && (
            <line
              x1={xFromIdx(hoverIdx)}
              x2={xFromIdx(hoverIdx)}
              y1={padding.top}
              y2={padding.top + chartH}
              stroke="#CBD5E1"
              strokeDasharray="4 4"
            />
          )}

          {data.map((d, i) => (
            <text
              key={d.label}
              x={points[i][0]}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

const DonutChart = ({
  data,
  size = 300,
  innerRatio = 0.62,
  palette = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],
  centerTextColor = "#0F172A",
  centerSubColor = "#64748B",
  ringBg = "#F8FAFC",
  sweepDuration = 1200,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const rInner = r * innerRatio;

  const describeArc = (cx, cy, rOuter, rInner, startAngle, endAngle) => {
    const toRad = (a) => (Math.PI / 180) * a;
    const sx = cx + rOuter * Math.cos(toRad(startAngle));
    const sy = cy + rOuter * Math.sin(toRad(startAngle));
    const ex = cx + rOuter * Math.cos(toRad(endAngle));
    const ey = cy + rOuter * Math.sin(toRad(endAngle));
    const isLarge = endAngle - startAngle > 180 ? 1 : 0;
    const sxi = cx + rInner * Math.cos(toRad(endAngle));
    const syi = cy + rInner * Math.sin(toRad(endAngle));
    const exi = cx + rInner * Math.cos(toRad(startAngle));
    const eyi = cy + rInner * Math.sin(toRad(startAngle));
    return [
      `M ${sx} ${sy}`,
      `A ${rOuter} ${rOuter} 0 ${isLarge} 1 ${ex} ${ey}`,
      `L ${sxi} ${syi}`,
      `A ${rInner} ${rInner} 0 ${isLarge} 0 ${exi} ${eyi}`,
      "Z",
    ].join(" ");
  };

  const [progress, setProgress] = useState(prefersReducedMotion ? 1 : 0);
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / sweepDuration);
      setProgress(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [data, prefersReducedMotion, sweepDuration]);

  const currentMaxAngle = -90 + 360 * progress;

  return (
    <div className="w-full flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        <defs>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.15"
            />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={r} fill={ringBg} />

        {(() => {
          let accAngle = 0;
          return data.map((d, i) => {
            const segAngle = (d.value / total) * 360;
            const start = -90 + accAngle;
            const unclampedEnd = -90 + accAngle + segAngle;
            const end = Math.min(unclampedEnd, currentMaxAngle);
            accAngle += segAngle;
            if (end <= start) return null;
            const path = describeArc(cx, cy, r, rInner, start, end);
            const isHover = hoverIdx === i;
            return (
              <path
                key={d.label}
                d={path}
                fill={palette[i % palette.length]}
                opacity={isHover ? 1 : 0.9}
                filter={isHover ? "url(#soft)" : "none"}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <title>{`${d.label}: ${d.value.toLocaleString()}`}</title>
              </path>
            );
          });
        })()}

        <circle cx={cx} cy={cy} r={rInner} fill="white" />

        {progress < 1 &&
          (() => {
            const rad = (Math.PI / 180) * currentMaxAngle;
            const bx = cx + r * Math.cos(rad);
            const by = cy + r * Math.sin(rad);
            return <circle cx={bx} cy={by} r="4" fill="#111827" />;
          })()}

        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill={centerTextColor}
        >
          {Math.round(total * progress).toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontSize="11"
          fill={centerSubColor}
        >
          Total
        </text>
      </svg>
    </div>
  );
};

const Dashboard = () => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [dueForHomeVisit, setDueForHomeVisit] = useState(0);
  const [activePatients, setActivePatients] = useState(0);
  const [pendingPreEnrollment, setPendingPreEnrollment] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  const CHART_HEIGHT = 220;
  const DONUT_SIZE = 160;
  const MONTHLY_BOX_MIN_H = CHART_HEIGHT + 80;

  const EDGE = {
    size: 22,
    stroke: 2,
    glowStroke: 4,
    glowBlur: 3,
    glowOpacity: 0.35,
  };

  const donutPalette = ["#749ab6", "#fcb814", "#6b7280", "#c5d7e5"];

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/patient/stats/");
      setTotalPatients(data.total_patients);
      setDueForHomeVisit(data.due_for_home_visit);
      setActivePatients(data.active_patients);
      setPendingPreEnrollment(data.pending_pre_enrollment);
      setMonthlyData(data.monthly_data);
    } catch (error) {
      console.error("Error fetching patient stats:", error);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      id: 1,
      icon: "/src/assets/images/dashboard/2patients.svg",
      label: "Total patient registered",
      value: totalPatients.toLocaleString(),
    },
    {
      id: 2,
      icon: "/src/assets/images/dashboard/home.svg",
      label: "Due for Home Visit",
      value: dueForHomeVisit.toLocaleString(),
    },
    {
      id: 3,
      icon: "/src/assets/images/dashboard/activepatient.svg",
      label: "Active Patients",
      value: activePatients.toLocaleString(),
    },
    {
      id: 4,
      icon: "/src/assets/images/dashboard/pending.svg",
      label: "Pending Pre Enrollment",
      value: pendingPreEnrollment.toLocaleString(),
    },
  ].map((c, i) => ({ ...c, accent: donutPalette[i % donutPalette.length] }));

  // const sampleMonthlyData = [
  //   { label: "Jan", value: 120 },
  //   { label: "Feb", value: 180 },
  //   { label: "Mar", value: 210 },
  //   { label: "Apr", value: 160 },
  //   { label: "May", value: 240 },
  //   { label: "Jun", value: 300 },
  //   { label: "Jul", value: 280 },
  //   { label: "Aug", value: 260 },
  //   { label: "Sep", value: 320 },
  //   { label: "Oct", value: 290 },
  //   { label: "Nov", value: 310 },
  //   { label: "Dec", value: 350 },
  // ];

  const donutData = [
    { label: "Registered", value: totalPatients },
    { label: "Due Home Visit", value: dueForHomeVisit },
    { label: "Active", value: activePatients },
    { label: "Pending Pre-Enroll", value: pendingPreEnrollment },
  ];

  const edgeProgress = useMountProgress(900);

  return (
    <div className="h-screen w-full bg-gray overflow-auto">
      <div className="flex-1 w-full p-5 space-y-5">
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-fit">
            {cards.map((c) => {
              const w = EDGE.size * edgeProgress;
              const h = EDGE.size * edgeProgress;
              const glowStyle = {
                width: w,
                height: h,
                borderBottom: `${EDGE.glowStroke}px solid ${c.accent}`,
                borderRight: `${EDGE.glowStroke}px solid ${c.accent}`,
                opacity: EDGE.glowOpacity,
                filter: `blur(${EDGE.glowBlur}px)`,
              };
              const sharpStyle = {
                width: w,
                height: h,
                borderBottom: `${EDGE.stroke}px solid ${c.accent}`,
                borderRight: `${EDGE.stroke}px solid ${c.accent}`,
                filter: `drop-shadow(0 0 ${EDGE.glowBlur * 2}px ${c.accent})`,
              };
              const borderStyle = {
                border: `1px solid ${hexToRgba(c.accent, 0.35)}`,
              };
              return (
                <div
                  key={c.id}
                  className="relative overflow-hidden bg-white w-full flex flex-col gap-1.5 items-start rounded-xl p-4 shadow"
                  style={borderStyle}
                >
                  <span
                    className="pointer-events-none absolute bottom-0 right-0 rounded-br-xl"
                    style={glowStyle}
                  />
                  <span
                    className="pointer-events-none absolute bottom-0 right-0 rounded-br-xl"
                    style={sharpStyle}
                  />
                  {c.id === 3 ? (
                    <img src={c.icon} alt="Icon" className="h-3.5" />
                  ) : (
                    <img src={c.icon} alt="Icon" className="h-2.5" />
                  )}
                  <p className="text-gray2 text-xs">{c.label}</p>
                  <p className="text-md font-bold">{c.value}</p>
                </div>
              );
            })}
          </div>

          <div className="flex-1 flex items-center justify-center">
            <DonutChart
              data={donutData}
              size={DONUT_SIZE}
              palette={donutPalette}
              ringBg="transparent"
              sweepDuration={1200}
            />
          </div>
        </div>

        <div
          className="bg-white/30 text-primary rounded-md p-4 shadow overflow-x-auto"
          style={{ minHeight: MONTHLY_BOX_MIN_H }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-bold text-gray-800">Monthly Trend</h2>
            <span className="text-xs text-gray-500">Last 12 months</span>
          </div>
          <GradientAreaChart
            data={monthlyData}
            height={CHART_HEIGHT}
            lineColor={donutPalette[0]}
            areaStartOpacity={0.28}
            areaEndOpacity={0}
            gridColor="#E2E8F0"
            labelColor="#334155"
            backgroundFill="transparent"
            drawDuration={1200}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
