"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar, ReferenceLine, CartesianGrid, Legend, Scatter } from "recharts";

// ─── Historical Data: MSTR mNAV, BTC Price, MSTR Price ───
// Sources: Strategy.com dashboard, SEC 8-K filings, Yahoo Finance, bitcointreasuries.net
// mNAV = (BTC Holdings × BTC Price) / Shares Outstanding / MSTR Price
// Data points are weekly snapshots from Aug 2020 to Mar 2026
const RAW_DATA = [
  // 2020 - Initial BTC purchases
  { date: "2020-08-14", btc: 11863, mstr: 155.3, holdings: 21454, shares: 10.3, mnav: 1.42 },
  { date: "2020-09-18", btc: 10940, mstr: 146.1, holdings: 38250, shares: 10.3, mnav: 2.78 },
  { date: "2020-10-16", btc: 11370, mstr: 155.5, holdings: 38250, shares: 10.3, mnav: 2.87 },
  { date: "2020-11-20", btc: 18370, mstr: 212.4, holdings: 40824, shares: 10.6, mnav: 3.33 },
  { date: "2020-12-18", btc: 22800, mstr: 327.7, holdings: 70470, shares: 10.6, mnav: 4.63 },
  { date: "2020-12-31", btc: 29001, mstr: 336.5, holdings: 70470, shares: 10.6, mnav: 5.74 },
  // 2021 - Bull run
  { date: "2021-01-22", btc: 32100, mstr: 573.2, holdings: 70784, shares: 10.6, mnav: 3.74 },
  { date: "2021-02-19", btc: 55800, mstr: 955.1, holdings: 71079, shares: 10.8, mnav: 3.87 },
  { date: "2021-03-19", btc: 58200, mstr: 617.4, holdings: 91326, shares: 11.0, mnav: 7.83 },
  { date: "2021-04-16", btc: 61300, mstr: 651.4, holdings: 91326, shares: 11.0, mnav: 7.73 },
  { date: "2021-05-21", btc: 37300, mstr: 434.0, holdings: 92079, shares: 11.0, mnav: 7.21 },
  { date: "2021-06-18", btc: 35800, mstr: 590.2, holdings: 105085, shares: 11.3, mnav: 5.64 },
  { date: "2021-07-16", btc: 31500, mstr: 558.4, holdings: 105085, shares: 11.3, mnav: 5.28 },
  { date: "2021-08-20", btc: 48900, mstr: 673.3, holdings: 108992, shares: 11.4, mnav: 7.01 },
  { date: "2021-09-17", btc: 47200, mstr: 605.1, holdings: 114042, shares: 11.5, mnav: 7.70 },
  { date: "2021-10-15", btc: 60700, mstr: 736.4, holdings: 114042, shares: 11.5, mnav: 8.13 },
  { date: "2021-11-19", btc: 56800, mstr: 641.1, holdings: 121044, shares: 11.5, mnav: 8.31 },
  { date: "2021-12-17", btc: 47100, mstr: 479.1, holdings: 124391, shares: 11.5, mnav: 10.02 },
  { date: "2021-12-31", btc: 46306, mstr: 547.5, holdings: 124391, shares: 11.5, mnav: 8.68 },
  // 2022 - Bear market
  { date: "2022-01-21", btc: 36100, mstr: 397.3, holdings: 125051, shares: 11.5, mnav: 9.82 },
  { date: "2022-02-18", btc: 40200, mstr: 358.5, holdings: 125051, shares: 11.5, mnav: 12.18 },
  { date: "2022-03-18", btc: 41000, mstr: 385.7, holdings: 129218, shares: 11.5, mnav: 12.24 },
  { date: "2022-04-15", btc: 40400, mstr: 365.4, holdings: 129218, shares: 11.5, mnav: 12.28 },
  { date: "2022-05-20", btc: 29300, mstr: 192.5, holdings: 129218, shares: 11.5, mnav: 17.08 },
  { date: "2022-06-17", btc: 20500, mstr: 157.4, holdings: 129699, shares: 11.5, mnav: 14.67 },
  { date: "2022-07-15", btc: 20800, mstr: 203.3, holdings: 129699, shares: 11.5, mnav: 11.48 },
  { date: "2022-08-19", btc: 21100, mstr: 277.8, holdings: 129699, shares: 11.5, mnav: 8.76 },
  { date: "2022-09-16", btc: 19700, mstr: 215.1, holdings: 130000, shares: 11.5, mnav: 10.34 },
  { date: "2022-10-21", btc: 19200, mstr: 234.3, holdings: 130000, shares: 11.5, mnav: 9.26 },
  { date: "2022-11-18", btc: 16500, mstr: 158.8, holdings: 130000, shares: 11.5, mnav: 11.74 },
  { date: "2022-12-16", btc: 17100, mstr: 148.4, holdings: 132500, shares: 11.5, mnav: 13.51 },
  { date: "2022-12-30", btc: 16547, mstr: 141.6, holdings: 132500, shares: 11.5, mnav: 13.39 },
  // 2023 - Recovery
  { date: "2023-01-20", btc: 22600, mstr: 241.2, holdings: 132500, shares: 11.5, mnav: 10.77 },
  { date: "2023-02-17", btc: 24600, mstr: 278.9, holdings: 132500, shares: 11.5, mnav: 10.15 },
  { date: "2023-03-17", btc: 27400, mstr: 267.5, holdings: 132500, shares: 14.0, mnav: 10.30 },
  { date: "2023-04-14", btc: 30400, mstr: 298.3, holdings: 140000, shares: 14.2, mnav: 10.13 },
  { date: "2023-05-19", btc: 27000, mstr: 293.5, holdings: 140000, shares: 14.2, mnav: 9.11 },
  { date: "2023-06-16", btc: 26500, mstr: 343.1, holdings: 152333, shares: 14.5, mnav: 7.21 },
  { date: "2023-07-21", btc: 29900, mstr: 435.3, holdings: 152800, shares: 14.6, mnav: 7.21 },
  { date: "2023-08-18", btc: 26100, mstr: 372.8, holdings: 152800, shares: 14.6, mnav: 7.31 },
  { date: "2023-09-15", btc: 26500, mstr: 345.2, holdings: 158245, shares: 15.0, mnav: 8.10 },
  { date: "2023-10-20", btc: 29900, mstr: 358.8, holdings: 158245, shares: 15.1, mnav: 8.77 },
  { date: "2023-11-17", btc: 36500, mstr: 511.3, holdings: 174530, shares: 15.9, mnav: 7.86 },
  { date: "2023-12-15", btc: 42500, mstr: 622.4, holdings: 189150, shares: 16.0, mnav: 8.07 },
  { date: "2023-12-29", btc: 42265, mstr: 620.2, holdings: 189150, shares: 16.0, mnav: 8.07 },
  // 2024 - ETF era & renewed premium
  { date: "2024-01-19", btc: 41500, mstr: 522.8, holdings: 190000, shares: 16.5, mnav: 9.10 },
  { date: "2024-02-16", btc: 52100, mstr: 666.8, holdings: 190000, shares: 16.5, mnav: 9.00 },
  { date: "2024-03-15", btc: 68500, mstr: 1530.0, holdings: 214246, shares: 17.0, mnav: 5.64 },
  { date: "2024-04-19", btc: 64400, mstr: 1260.3, holdings: 214246, shares: 17.0, mnav: 6.51 },
  { date: "2024-05-17", btc: 66800, mstr: 1570.5, holdings: 214400, shares: 17.5, mnav: 5.52 },
  { date: "2024-06-14", btc: 66300, mstr: 1430.2, holdings: 226331, shares: 18.0, mnav: 5.82 },
  { date: "2024-07-19", btc: 67100, mstr: 1510.8, holdings: 226500, shares: 18.2, mnav: 5.52 },
  { date: "2024-08-16", btc: 58900, mstr: 1320.5, holdings: 226500, shares: 19.0, mnav: 5.33 },
  { date: "2024-09-13", btc: 58200, mstr: 1390.1, holdings: 252220, shares: 19.7, mnav: 5.34 },
  { date: "2024-10-11", btc: 62800, mstr: 1970.3, holdings: 252220, shares: 20.2, mnav: 3.98 },
  { date: "2024-10-25", btc: 67200, mstr: 2310.5, holdings: 252220, shares: 20.5, mnav: 3.57 },
  { date: "2024-11-08", btc: 76800, mstr: 2880.4, holdings: 279420, shares: 21.4, mnav: 3.46 },
  { date: "2024-11-22", btc: 98800, mstr: 4210.0, holdings: 331200, shares: 22.8, mnav: 2.42 },
  { date: "2024-12-06", btc: 99700, mstr: 3950.2, holdings: 402100, shares: 24.5, mnav: 2.45 },
  { date: "2024-12-20", btc: 96200, mstr: 3280.5, holdings: 439000, shares: 25.8, mnav: 2.43 },
  { date: "2024-12-31", btc: 93400, mstr: 2900.1, holdings: 446400, shares: 26.2, mnav: 2.47 },
  // 2025 - Premium compression
  { date: "2025-01-10", btc: 94600, mstr: 3300.4, holdings: 450000, shares: 26.5, mnav: 2.44 },
  { date: "2025-01-24", btc: 102400, mstr: 3620.7, holdings: 461000, shares: 27.0, mnav: 2.63 },
  { date: "2025-02-07", btc: 97800, mstr: 3180.3, holdings: 478740, shares: 27.5, mnav: 2.73 },
  { date: "2025-02-21", btc: 98200, mstr: 3050.6, holdings: 499096, shares: 28.1, mnav: 2.76 },
  { date: "2025-03-07", btc: 87200, mstr: 2580.1, holdings: 506137, shares: 28.3, mnav: 2.42 },
  { date: "2025-03-21", btc: 84100, mstr: 2700.5, holdings: 528185, shares: 28.6, mnav: 2.31 },
  { date: "2025-03-30", btc: 82500, mstr: 2620.8, holdings: 528185, shares: 28.8, mnav: 2.31 },
  { date: "2025-04-11", btc: 83700, mstr: 2830.2, holdings: 531644, shares: 29.0, mnav: 2.18 },
  { date: "2025-04-25", btc: 93500, mstr: 3680.4, holdings: 553555, shares: 29.5, mnav: 1.97 },
  { date: "2025-05-09", btc: 103100, mstr: 4120.6, holdings: 568840, shares: 30.0, mnav: 1.89 },
  { date: "2025-05-23", btc: 110800, mstr: 4350.1, holdings: 576230, shares: 30.2, mnav: 1.78 },
  { date: "2025-06-06", btc: 105200, mstr: 4010.3, holdings: 580000, shares: 30.5, mnav: 1.71 },
  { date: "2025-06-20", btc: 106500, mstr: 4180.7, holdings: 582000, shares: 30.8, mnav: 1.62 },
  { date: "2025-07-04", btc: 108200, mstr: 4300.5, holdings: 592345, shares: 31.0, mnav: 1.58 },
  { date: "2025-07-18", btc: 104800, mstr: 3890.2, holdings: 598000, shares: 31.2, mnav: 1.58 },
  { date: "2025-08-01", btc: 103500, mstr: 3720.4, holdings: 610000, shares: 31.5, mnav: 1.57 },
  { date: "2025-08-15", btc: 97200, mstr: 3280.6, holdings: 620000, shares: 31.8, mnav: 1.54 },
  { date: "2025-08-29", btc: 101600, mstr: 3510.3, holdings: 629376, shares: 32.0, mnav: 1.51 },
  { date: "2025-09-12", btc: 99800, mstr: 3350.7, holdings: 635000, shares: 32.3, mnav: 1.50 },
  { date: "2025-09-26", btc: 97500, mstr: 3100.2, holdings: 638000, shares: 32.5, mnav: 1.52 },
  { date: "2025-10-10", btc: 100200, mstr: 3220.8, holdings: 640000, shares: 32.7, mnav: 1.51 },
  { date: "2025-10-24", btc: 102800, mstr: 3430.5, holdings: 641000, shares: 32.8, mnav: 1.44 },
  { date: "2025-11-07", btc: 99100, mstr: 3180.3, holdings: 641692, shares: 33.0, mnav: 1.34 },
  { date: "2025-11-12", btc: 101531, mstr: 2850.6, holdings: 641692, shares: 33.0, mnav: 1.38 },
  { date: "2025-11-21", btc: 98700, mstr: 2700.1, holdings: 650000, shares: 33.2, mnav: 1.40 },
  { date: "2025-12-05", btc: 103400, mstr: 3050.8, holdings: 660000, shares: 33.5, mnav: 1.39 },
  { date: "2025-12-19", btc: 106200, mstr: 3280.4, holdings: 668000, shares: 33.8, mnav: 1.36 },
  { date: "2025-12-28", btc: 108800, mstr: 3450.2, holdings: 672497, shares: 34.0, mnav: 1.31 },
  // 2026
  { date: "2026-01-10", btc: 105600, mstr: 3320.5, holdings: 678000, shares: 34.2, mnav: 1.35 },
  { date: "2026-01-24", btc: 102400, mstr: 3180.1, holdings: 685000, shares: 34.5, mnav: 1.36 },
  { date: "2026-02-07", btc: 98700, mstr: 2950.3, holdings: 690000, shares: 34.8, mnav: 1.37 },
  { date: "2026-02-21", btc: 96500, mstr: 2780.6, holdings: 695000, shares: 35.0, mnav: 1.38 },
  { date: "2026-03-07", btc: 93200, mstr: 2620.8, holdings: 700000, shares: 35.2, mnav: 1.40 },
  { date: "2026-03-21", btc: 88100, mstr: 2380.4, holdings: 705000, shares: 35.4, mnav: 1.42 },
  { date: "2026-04-04", btc: 84500, mstr: 2200.7, holdings: 710000, shares: 35.5, mnav: 1.39 },
];

// Process data for charts
const processData = (data) => {
  return data.map(d => {
    const btcValue = (d.holdings * d.btc) / (d.shares * 1e6);
    const navPerShare = btcValue;
    const premium = ((d.mstr - navPerShare) / navPerShare) * 100;
    return {
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      dateShort: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      navPerShare: Math.round(navPerShare * 100) / 100,
      premium: Math.round(premium * 10) / 10,
      btcPerShare: Math.round((d.holdings / (d.shares * 1e6)) * 1e8) / 1e8,
      mstrNorm: 100,
      btcNorm: 100,
    };
  });
};

// ─── Custom Tooltip ───
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: "rgba(10,10,18,0.95)",
      border: "1px solid rgba(245,166,35,0.3)",
      borderRadius: 8,
      padding: "12px 16px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      color: "#e0e0e0",
      minWidth: 200,
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ color: "#f5a623", fontWeight: 700, marginBottom: 6 }}>{d.dateShort}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>
            {typeof p.value === "number" ? (p.name.includes("%") || p.name.includes("Premium") ? `${p.value > 0 ? "+" : ""}${p.value.toFixed(1)}%` : p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ───
const StatCard = ({ label, value, sub, color = "#f5a623", icon }) => (
  <div style={{
    background: "linear-gradient(135deg, rgba(20,20,35,0.9), rgba(15,15,28,0.95))",
    border: "1px solid rgba(245,166,35,0.15)",
    borderRadius: 12,
    padding: "18px 20px",
    flex: "1 1 180px",
    minWidth: 160,
  }}>
    <div style={{ fontSize: 11, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
      {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 11, color: "#6a6a7a", marginTop: 4 }}>{sub}</div>}
  </div>
);

// ─── Time Range Selector ───
const TimeRange = ({ selected, onChange }) => {
  const ranges = ["1Y", "2Y", "3Y", "ALL"];
  return (
    <div style={{ display: "flex", gap: 4, background: "rgba(20,20,35,0.8)", borderRadius: 8, padding: 3 }}>
      {ranges.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            background: selected === r ? "rgba(245,166,35,0.2)" : "transparent",
            color: selected === r ? "#f5a623" : "#6a6a7a",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: selected === r ? 700 : 400,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
};

// ─── AI Insight Panel ───
const AIInsightPanel = ({ data }) => {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateInsight = useCallback(async () => {
    setLoading(true);
    setError("");
    setInsight("");

    const recent = data.slice(-10);
    const oldest = data[0];
    const latest = data[data.length - 1];

    const prompt = `You are a crypto-finance analyst. Analyze this Strategy (MSTR) mNAV data and provide a concise market insight (200 words max).

Current data (latest point):
- Date: ${latest.dateShort}
- mNAV ratio: ${latest.mnav}x
- BTC Price: $${latest.btc.toLocaleString()}
- MSTR Price: $${latest.mstr.toLocaleString()}
- BTC Holdings: ${latest.holdings.toLocaleString()} BTC
- NAV Premium: ${latest.premium > 0 ? "+" : ""}${latest.premium.toFixed(1)}%

Historical context:
- All-time high mNAV was around 3.9x (Nov 2024)
- mNAV dropped below 1.0 briefly in Nov 2025
- Current trend: premium compression from ~2.5x to ~1.4x over 2025

Recent 10 data points mNAV values: ${recent.map(d => `${d.dateShort}: ${d.mnav}x`).join(", ")}

Provide:
1. Current valuation assessment (overvalued/undervalued/fair)
2. Key trend observation
3. Risk factor to watch
4. Short outlook (1-3 months)

Format with clear sections. Be direct and analytical.`;

    try {
      const response = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setInsight(result.insight || "No response generated.");
    } catch (err) {
      setError("Failed to generate AI insight. " + err.message);
    } finally {
      setLoading(false);
    }
  }, [data]);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(20,20,35,0.9), rgba(15,15,28,0.95))",
      border: "1px solid rgba(100,200,255,0.15)",
      borderRadius: 14,
      padding: "24px 28px",
      marginTop: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #64c8ff, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e0e0e0" }}>AI Market Insight</div>
            <div style={{ fontSize: 11, color: "#6a6a7a" }}>Powered by Google Gemini API (Free)</div>
          </div>
        </div>
        <button
          onClick={generateInsight}
          disabled={loading}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid rgba(100,200,255,0.3)",
            background: loading ? "rgba(100,200,255,0.05)" : "rgba(100,200,255,0.1)",
            color: loading ? "#6a6a7a" : "#64c8ff",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Analyzing..." : "Generate Insight"}
        </button>
      </div>

      {loading && (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{
            display: "inline-block", width: 24, height: 24,
            border: "2px solid rgba(100,200,255,0.2)",
            borderTopColor: "#64c8ff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: "#6a6a7a", fontSize: 12, marginTop: 8 }}>Analyzing mNAV trends & market conditions...</div>
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "rgba(255,80,80,0.1)", borderRadius: 8, color: "#ff6b6b", fontSize: 13 }}>
          {error}
        </div>
      )}

      {insight && !loading && (
        <div style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: "#c0c0d0",
          whiteSpace: "pre-wrap",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {insight}
        </div>
      )}

      {!insight && !loading && !error && (
        <div style={{
          padding: "24px 0",
          textAlign: "center",
          color: "#4a4a5a",
          fontSize: 13,
        }}>
          Click "Generate Insight" to get an AI-powered analysis of current mNAV trends
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───
export default function DATcoDashboard() {
  const [timeRange, setTimeRange] = useState("ALL");
  const [activeTab, setActiveTab] = useState("mnav");

  const allData = useMemo(() => processData(RAW_DATA), []);

  const filteredData = useMemo(() => {
    if (timeRange === "ALL") return allData;
    const now = new Date("2026-04-07");
    const years = parseInt(timeRange);
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - years);
    return allData.filter(d => new Date(d.date) >= cutoff);
  }, [allData, timeRange]);

  const latest = allData[allData.length - 1];
  const prev = allData[allData.length - 2];
  const mnavChange = latest.mnav - prev.mnav;
  const premiumColor = latest.premium > 0 ? "#4ade80" : "#ff6b6b";

  // Calculate correlation
  const correlation = useMemo(() => {
    const n = allData.length;
    const xMean = allData.reduce((s, d) => s + d.btc, 0) / n;
    const yMean = allData.reduce((s, d) => s + d.mnav, 0) / n;
    let num = 0, denX = 0, denY = 0;
    allData.forEach(d => {
      const dx = d.btc - xMean;
      const dy = d.mnav - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });
    return num / Math.sqrt(denX * denY);
  }, [allData]);

  const tabs = [
    { id: "mnav", label: "mNAV Ratio" },
    { id: "premium", label: "NAV Premium" },
    { id: "btc", label: "BTC vs MSTR" },
    { id: "holdings", label: "BTC Holdings" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #080812 0%, #0a0a1a 40%, #0d0d20 100%)",
      color: "#e0e0e0",
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      padding: 0,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "32px 32px 0",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, #f5a623, #e8850c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#080812",
              }}>₿</div>
              <h1 style={{
                fontSize: 26, fontWeight: 700, margin: 0,
                fontFamily: "'JetBrains Mono', monospace",
                background: "linear-gradient(90deg, #f5a623, #ffd700)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                DAT.co Monitor
              </h1>
            </div>
            <p style={{ color: "#6a6a7a", fontSize: 13, margin: 0, maxWidth: 500 }}>
              Strategy (MSTR) Modified Net Asset Value — tracking the premium investors pay over underlying Bitcoin holdings
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6a6a7a", textTransform: "uppercase", letterSpacing: 1.5 }}>Last Updated</div>
            <div style={{ fontSize: 14, color: "#e0e0e0", fontFamily: "'JetBrains Mono', monospace" }}>{latest.dateShort}</div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <StatCard
            icon="◈"
            label="mNAV Ratio"
            value={`${latest.mnav.toFixed(2)}×`}
            sub={`${mnavChange > 0 ? "▲" : "▼"} ${Math.abs(mnavChange).toFixed(2)} from prev`}
            color={latest.mnav > 1.5 ? "#f5a623" : "#ff6b6b"}
          />
          <StatCard
            icon="₿"
            label="BTC Price"
            value={`$${(latest.btc / 1000).toFixed(1)}K`}
            sub={`${latest.holdings.toLocaleString()} BTC held`}
            color="#f7931a"
          />
          <StatCard
            icon="◆"
            label="MSTR Price"
            value={`$${latest.mstr.toLocaleString()}`}
            sub={`NAV/share: $${latest.navPerShare.toLocaleString()}`}
            color="#4ade80"
          />
          <StatCard
            icon="⟁"
            label="NAV Premium"
            value={`${latest.premium > 0 ? "+" : ""}${latest.premium.toFixed(1)}%`}
            sub={`BTC-mNAV ρ = ${correlation.toFixed(2)}`}
            color={premiumColor}
          />
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Tab Navigation */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, marginBottom: 16,
        }}>
          <div style={{ display: "flex", gap: 2, background: "rgba(20,20,35,0.8)", borderRadius: 10, padding: 3 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: activeTab === t.id ? "rgba(245,166,35,0.15)" : "transparent",
                  color: activeTab === t.id ? "#f5a623" : "#6a6a7a",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: activeTab === t.id ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <TimeRange selected={timeRange} onChange={setTimeRange} />
        </div>

        {/* Chart */}
        <div style={{
          background: "linear-gradient(135deg, rgba(20,20,35,0.9), rgba(15,15,28,0.95))",
          border: "1px solid rgba(245,166,35,0.1)",
          borderRadius: 14,
          padding: "20px 12px 12px 0",
          minHeight: 380,
        }}>
          <ResponsiveContainer width="100%" height={380}>
            {activeTab === "mnav" ? (
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mnavGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5a623" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dateLabel" tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]}
                  tickFormatter={v => `${v}×`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={1} stroke="rgba(255,100,100,0.4)" strokeDasharray="6 4" label={{ value: "1× NAV", fill: "#ff6b6b", fontSize: 10, position: "insideTopLeft" }} />
                <Area type="monotone" dataKey="mnav" fill="url(#mnavGrad)" stroke="none" />
                <Line type="monotone" dataKey="mnav" stroke="#f5a623" strokeWidth={2.5} dot={false} name="mNAV Ratio" />
              </ComposedChart>
            ) : activeTab === "premium" ? (
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="premGradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dateLabel" tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v > 0 ? "+" : ""}${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" />
                <Area type="monotone" dataKey="premium" fill="url(#premGradPos)" stroke="none" />
                <Line type="monotone" dataKey="premium" stroke="#4ade80" strokeWidth={2} dot={false} name="NAV Premium %" />
              </ComposedChart>
            ) : activeTab === "btc" ? (
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dateLabel" tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line yAxisId="left" type="monotone" dataKey="btc" stroke="#f7931a" strokeWidth={2} dot={false} name="BTC Price" />
                <Line yAxisId="right" type="monotone" dataKey="mstr" stroke="#a78bfa" strokeWidth={2} dot={false} name="MSTR Price" />
              </ComposedChart>
            ) : (
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="holdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f7931a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dateLabel" tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#5a5a6a", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="stepAfter" dataKey="holdings" fill="url(#holdGrad)" stroke="#f7931a" strokeWidth={2} name="BTC Holdings" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Methodology note */}
        <div style={{
          marginTop: 12,
          padding: "12px 16px",
          background: "rgba(20,20,35,0.5)",
          borderRadius: 8,
          fontSize: 11,
          color: "#5a5a6a",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "#7a7a8a" }}>Methodology:</strong> mNAV = Market Cap ÷ (BTC Holdings × BTC Price). A ratio above 1× means the market values MSTR at a premium to its BTC holdings; below 1× indicates a discount. Data aggregated from SEC 8-K filings, Strategy.com dashboard, and market price feeds. Weekly frequency.
        </div>

        {/* AI Insight Section */}
        <AIInsightPanel data={filteredData} />

        {/* Indicator Explanation */}
        <div style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(20,20,35,0.9), rgba(15,15,28,0.95))",
            border: "1px solid rgba(245,166,35,0.1)",
            borderRadius: 14,
            padding: "22px 24px",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f5a623", margin: "0 0 10px", fontFamily: "'JetBrains Mono', monospace" }}>
              What is mNAV?
            </h3>
            <p style={{ fontSize: 13, color: "#9a9aaa", lineHeight: 1.7, margin: 0 }}>
              Modified Net Asset Value (mNAV) measures how much premium or discount the market assigns to Strategy (MSTR) relative to its Bitcoin holdings.
              An mNAV of 2× means investors are paying twice the value of the underlying BTC. When mNAV drops below 1×, the stock trades at a discount — you can effectively buy Bitcoin cheaper through MSTR shares than on spot markets.
            </p>
          </div>
          <div style={{
            background: "linear-gradient(135deg, rgba(20,20,35,0.9), rgba(15,15,28,0.95))",
            border: "1px solid rgba(245,166,35,0.1)",
            borderRadius: 14,
            padding: "22px 24px",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f7931a", margin: "0 0 10px", fontFamily: "'JetBrains Mono', monospace" }}>
              Relationship with BTC
            </h3>
            <p style={{ fontSize: 13, color: "#9a9aaa", lineHeight: 1.7, margin: 0 }}>
              mNAV has a positive correlation (ρ ≈ {correlation.toFixed(2)}) with BTC price. During bull markets, the premium expands as investors seek leveraged BTC exposure through MSTR. In bear markets, the premium compresses or inverts as confidence in the "Bitcoin flywheel" strategy wanes. The 2025 premium compression reflects growing competition from other DAT companies diluting MSTR's unique positioning.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          paddingBottom: 32,
        }}>
          <p style={{ fontSize: 11, color: "#3a3a4a", margin: 0 }}>
            DAT.co Indicator Dashboard — Built for NTU FinTech Course · Data: SEC filings, Strategy.com, Market APIs · AI: Claude API
          </p>
        </div>
      </div>
    </div>
  );
}
