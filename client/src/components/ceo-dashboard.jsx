import { createContext, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  BarChart,
  LabelList } from
"recharts";
import {







  UserCheck,















  ChevronDown,













  IndianRupee,
  BadgeCheck,
  UserRound,
  Percent,
  Gauge,
  AlertTriangle,
  ShieldAlert,
  ClipboardList,
  Clock3,
  FileWarning,
  Wrench,
  Gavel,
  AlertOctagon,
  FileClock,
  Cctv,
  Package,
  Monitor,
  Receipt,
  ClipboardCheck,
  FileCheck2,
  Lock,
  Award,
  Info } from
"lucide-react";

import referenceBanner from "@/assets/ceo-reference-banner.jpg.asset.json";
import "./ceo-dashboard.css";
import { CeoAsk } from "./ceo-ask";

const C = {
  blue: "var(--ceo-blue)",
  red: "var(--ceo-red)",
  green: "var(--ceo-green)",
  amber: "var(--ceo-amber)",
  violet: "var(--ceo-violet)",
  teal: "var(--ceo-teal)",
  grid: "var(--ceo-line)",
  muted: "var(--ceo-muted)"
};
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const disb = months.map((m, i) => ({ m, actual: 30 + i * 15.5, target: 40 + i * 17 }));
const productMix = [
{ n: "Two Wheeler", p: "22%", v: "₹ 275 Cr", c: C.blue, val: 22 },
{ n: "MSME", p: "29%", v: "₹ 362 Cr", c: C.red, val: 29 },
{ n: "LAP", p: "25%", v: "₹ 312 Cr", c: C.violet, val: 25 },
{ n: "Solar Loan", p: "10%", v: "₹ 225 Cr", c: C.amber, val: 10 },
{ n: "Tractor Loan", p: "14%", v: "₹ 174 Cr", c: C.amber, val: 14 }];

const quality = [
{ n: "Standard", p: "94.2%", v: "₹ 1,175 Cr", c: C.teal, val: 94.2 },
{ n: "DPD 1-30", p: "3.1%", v: "₹ 39 Cr", c: C.blue, val: 3.1 },
{ n: "DPD 31-60", p: "1.2%", v: "₹ 15 Cr", c: C.amber, val: 1.2 },
{ n: "DPD 61-90", p: "0.8%", v: "₹ 10 Cr", c: C.red, val: 0.8 },
{ n: "NPA 90+", p: "0.7%", v: "₹ 9 Cr", c: C.red, val: 0.7 }];

const collection = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({
  m,
  due: [38, 42, 45, 40, 52, 50, 55][i],
  col: [36, 40, 43, 38, 50, 48, 53][i],
  eff: 92 + i % 3
}));
const tat = [
{ d: "< 1 Day", v: 34 },
{ d: "1-2 Days", v: 28 },
{ d: "2-3 Days", v: 18 },
{ d: "3-5 Days", v: 14 },
{ d: "> 5 Days", v: 6 }];

const grades = [
{ n: "A (34%)", v: 34, c: C.teal },
{ n: "B (28%)", v: 28, c: C.blue },
{ n: "C (18%)", v: 18, c: C.amber },
{ n: "D (12%)", v: 12, c: C.red },
{ n: "E (8%)", v: 8, c: C.violet }];

const spark = (seed) =>
Array.from({ length: 12 }, (_, i) => 6 + i * 1.3 + i * seed % 5 * 1.6);

function Spark({ color, seed, bars }) {
  const d = spark(seed);
  if (bars)
  return (
    <svg className="ceo-spark" viewBox="0 0 60 26">
        {d.map((v, i) =>
      <rect
        key={i}
        x={i * 5}
        y={26 - v}
        width="3"
        height={v}
        fill={i % 3 === 0 ? C.red : "var(--ceo-red-soft2)"} />

      )}
      </svg>);

  const pts = d.map((v, i) => `${i * 5.4},${26 - v}`).join(" ");
  return (
    <svg className="ceo-spark" viewBox="0 0 60 26">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>);

}

const kpis = [
{ t: "Total AUM", v: "₹ 1,248 Cr", d: "12.5%", up: true, c: C.blue, i: IndianRupee, tone: "red" },
{ t: "Disbursement", v: "₹ 186 Cr", d: "28.4%", up: true, c: C.red, i: Receipt, tone: "blue" },
{ t: "Sanctioned", v: "₹ 214 Cr", d: "31.2%", up: true, c: C.green, i: BadgeCheck, tone: "red" },
{
  t: "Active Customers",
  v: "52,318",
  d: "8.2%",
  up: true,
  c: C.violet,
  i: UserRound,
  tone: "blue"
},
{ t: "Approval Ratio", v: "78.3%", d: "8.1%", up: true, c: C.green, i: Percent, tone: "violet" },
{
  t: "Collection Efficiency",
  v: "96.4%",
  d: "4.1%",
  up: true,
  c: C.blue,
  i: Gauge,
  tone: "blue"
},
{
  t: "Portfolio at Risk",
  v: "2.6%",
  d: "0.8%",
  up: false,
  c: C.red,
  i: AlertTriangle,
  tone: "red",
  bars: true
},
{ t: "NPA", v: "1.8%", d: "0.4%", up: false, c: C.red, i: ShieldAlert, tone: "red", bars: true }];


const kpiInfo = {
  "Total AUM": {
    desc: "Total outstanding loan book across all products.",
    prev: "₹ 1,109 Cr",
    target: "₹ 1,300 Cr",
    view: "repayments"
  },
  Disbursement: {
    desc: "Loan amount paid out to customers in the period.",
    prev: "₹ 145 Cr",
    target: "₹ 215 Cr",
    view: "applications"
  },
  Sanctioned: {
    desc: "Loan amount approved by credit in the period.",
    prev: "₹ 163 Cr",
    target: "₹ 240 Cr",
    view: "underwriting"
  },
  "Active Customers": {
    desc: "Customers with at least one live loan.",
    prev: "48,354",
    target: "55,000",
    view: "crm"
  },
  "Approval Ratio": {
    desc: "Share of applications approved after credit review.",
    prev: "72.4%",
    target: "80.0%",
    view: "underwriting"
  },
  "Collection Efficiency": {
    desc: "Amount collected as a share of amount due.",
    prev: "92.6%",
    target: "97.0%",
    view: "repayments"
  },
  "Portfolio at Risk": {
    desc: "Share of loan book overdue by more than 30 days.",
    prev: "3.4%",
    target: "< 2.5%",
    view: "repayments"
  },
  NPA: {
    desc: "Loans overdue 90+ days as a share of the book.",
    prev: "2.2%",
    target: "< 1.5%",
    view: "repayments"
  }
};
const trend = (t) => {
  const k = kpis.find((x) => x.t === t);
  if (!k) return [];
  const end = parseFloat(k.v.replace(/[^0-9.]/g, ""));
  const d = parseFloat(k.d);
  const start = k.v.includes("%") ? k.up ? end - d : end + d : end / (1 + d / 100);
  const n = months.length - 1;
  return months.map((m, i) => ({
    m,
    v: +((start + (end - start) * i / n) * (i === n ? 1 : 1 + (i * 7 % 5 - 2) / 120)).toFixed(
      2
    )
  }));
};


const DetailContext = createContext(() => {});
const sectionViews = {
  "Target vs Actual Disbursement": "disbursement",
  "Product Mix & Performance": "applications",
  "Loan Conversion Funnel": "crm",
  "Branch Performance": "hierarchy",
  "Portfolio Quality": "repayments",
  "Collection Performance": "repayments",
  "Credit Command Center": "credit",
  "Employee Performance": "hrms",
  "Management Watchlist": "approvals",
  "Geographic Business Performance": "reports",
  "Assets & Admin Overview": "assetInventory",
  "Governance, Audit & Compliance": "auditManagement"
};
function Card({
  title,
  right,
  children,
  className = ""





}) {
  const show = useContext(DetailContext);
  return (
    <section
      className={"ceo-card ceo-detail-card " + className}
      onClick={(event) => {
        if (event.target.closest(".ceo-tabs")) return;
        const section = event.currentTarget;
        const heading = section.querySelector("h2")?.textContent?.trim() ?? "Dashboard";
        const item = event.target.closest(
          "tbody tr,li,.ceo-minis>div,.ceo-tiles>div,.ceo-funnel>div"
        );
        const label =
        item?.querySelector("small")?.textContent ||
        item?.querySelector("span")?.textContent ||
        item?.querySelector("td:nth-child(2)")?.textContent;
        const key = Object.keys(sectionViews).find((k) => heading.startsWith(k));
        show({
          title: label ? heading + " — " + label : heading,
          content: children,
          view: key ? sectionViews[key] ?? "reports" : "reports"
        });
      }}>
      
      <header className="ceo-card-head">
        <Button
          variant="ceo"
          className="ceo-card-title"
          aria-label={"Open " + (typeof title === "string" ? title : "section") + " details"}>
          
          <h2>{title}</h2>
        </Button>
        {right}
      </header>
      {children}
    </section>);

}
const Pill = ({ children }) =>
<Button variant="ceo" type="button" className="ceo-pill">
    {children}
    <ChevronDown />
  </Button>;

const Tabs = ({
  items,
  value,
  onChange




}) =>
<div className="ceo-tabs">
    {items.map((t) =>
  <Button
    variant="ceo"
    type="button"
    key={t}
    className={t === value ? "on" : ""}
    onClick={() => onChange(t)}>
    
        {t}
      </Button>
  )}
  </div>;

function Donut({
  data,
  center,
  sub,
  size = 100





}) {
  return (
    <div className="ceo-donut" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={data}
            dataKey={data[0]?.val !== undefined ? "val" : "v"}
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none">
            
            {data.map((d, i) =>
            <Cell key={i} fill={d.c} />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div>
        <strong>{center}</strong>
        <span>{sub}</span>
      </div>
    </div>);

}

const filters = [
"FY 2026-27",
"All Products",
"All Regions",
"All States",
"All Branches",
"All Departments",
"Compare With",
"Previous Month"];


export function CeoDashboardContent() {
  const [period, setPeriod] = useState("MTD");
  const [mix, setMix] = useState("AUM");
  const [bTab, setBTab] = useState("Top Branches");
  const [eTab, setETab] = useState("Top Performers");
  const [openKpi, setOpenKpi] = useState(null);
  const [detail, setDetail] = useState(null);

  return (
    <DetailContext.Provider value={setDetail}>
      <div className="ceo-root ceo-portal-mode">
        <div className="ceo-main">
          <div className="ceo-content">
            <div className="ceo-filters">
              <Button variant="ceo" type="button" className="ceo-today">
                Today
              </Button>
              <div className="ceo-seg">
                {["MTD", "QTD", "YTD"].map((p) =>
                <Button
                  variant="ceo"
                  type="button"
                  key={p}
                  className={p === period ? "on" : ""}
                  onClick={() => setPeriod(p)}>
                  
                    {p}
                  </Button>
                )}
              </div>
              {filters.map((f) =>
              <Button variant="ceo" type="button" key={f} className="ceo-select">
                  {f}
                  <ChevronDown />
                </Button>
              )}
            </div>

            <section
              className="ceo-banner"
              aria-label="Empowering with Care, Compassion and Confidence — Hum Badlenge Aapki Duniya. Jitendra Tanwar, MD & CEO, Namdev Finvest Pvt. Ltd.">
              
              <img
                src={referenceBanner.url}
                alt="Namdev Finvest: Empowering with Care, Compassion and Confidence. Two Wheeler, MSME, Solar, E-Rickshaw, Tractor and LAP loans. Jitendra Tanwar, MD & CEO. Financial services that create opportunities for a stronger, self-reliant Bharat." />
              
            </section>

            <div className="ceo-kpis">
              {kpis.map((k, idx) => {
                const I = k.i;
                const info = kpiInfo[k.t] ?? {
                  desc: "",
                  prev: "—",
                  target: "—",
                  view: "applications"
                };
                return (
                  <article
                    key={k.t}
                    className="ceo-kpi"
                    tabIndex={0}
                    role="button"
                    aria-label={`${k.t} ${k.v}, open details`}
                    onClick={() => setOpenKpi(k.t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenKpi(k.t);
                      }
                    }}>
                    
                    <div className="ceo-kpi-t">
                      <span className={"ceo-ic " + k.tone}>
                        <I />
                      </span>
                      {k.t}
                    </div>
                    <strong>{k.v}</strong>
                    <div className="ceo-kpi-b">
                      <div>
                        <span className={k.up ? "up" : "down"}>
                          {k.up ? "↑" : "↓"} {k.d}
                        </span>
                        <small>vs last period</small>
                      </div>
                      <Spark color={k.c} seed={k.t.length} bars={k.bars === true} />
                    </div>
                    <div
                      className={"ceo-kpi-pop" + (idx >= kpis.length - 2 ? " right" : "")}
                      role="tooltip">
                      
                      <b>
                        {k.t} · {period}
                      </b>
                      <p>{info.desc}</p>
                      <div className="ceo-kpi-mini">
                        <ResponsiveContainer>
                          <LineChart
                            data={trend(k.t)}
                            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                            
                            <YAxis hide domain={["auto", "auto"]} />
                            <XAxis
                              dataKey="m"
                              tick={{ fontSize: 8, fill: C.muted }}
                              axisLine={false}
                              tickLine={false}
                              interval={2} />
                            
                            <Line
                              isAnimationActive={false}
                              dataKey="v"
                              stroke={k.c}
                              strokeWidth={1.8}
                              dot={false} />
                            
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <dl>
                        <div>
                          <dt>Current</dt>
                          <dd>{k.v}</dd>
                        </div>
                        <div>
                          <dt>Previous</dt>
                          <dd>{info.prev}</dd>
                        </div>
                        <div>
                          <dt>Target</dt>
                          <dd>{info.target}</dd>
                        </div>
                      </dl>
                      <small>Click for full details</small>
                    </div>
                  </article>);

              })}
            </div>
            {openKpi &&
            (() => {
              const k = kpis.find((x) => x.t === openKpi);
              if (!k) return null;
              const info = kpiInfo[k.t] ?? {
                desc: "",
                prev: "—",
                target: "—",
                view: "applications"
              };
              const I = k.i;
              return (
                <Dialog
                  open
                  onOpenChange={(value) => {
                    if (!value) setOpenKpi(null);
                  }}>
                  
                    <DialogContent className="ceo-root ceo-modal" aria-label={k.t + " details"}>
                      <header>
                        <span className={"ceo-ic " + k.tone}>
                          <I />
                        </span>
                        <div>
                          <DialogTitle>{k.t}</DialogTitle>
                          <DialogDescription>{info.desc}</DialogDescription>
                        </div>
                      </header>
                      <div className="ceo-modal-stats">
                        <div>
                          <b>{k.v}</b>
                          <span>Current ({period})</span>
                        </div>
                        <div>
                          <b>{info.prev}</b>
                          <span>Previous period</span>
                        </div>
                        <div>
                          <b>{info.target}</b>
                          <span>Target</span>
                        </div>
                        <div>
                          <b className={k.up ? "up" : "down"}>
                            {k.up ? "↑" : "↓"} {k.d}
                          </b>
                          <span>Change</span>
                        </div>
                      </div>
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer>
                          <LineChart
                          data={trend(k.t)}
                          margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                          
                            <CartesianGrid stroke={C.grid} vertical={false} />
                            <XAxis
                            dataKey="m"
                            tick={{ fontSize: 10, fill: C.muted }}
                            axisLine={false}
                            tickLine={false} />
                          
                            <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fontSize: 10, fill: C.muted }}
                            axisLine={false}
                            tickLine={false} />
                          
                            <Tooltip />
                            <Line
                            isAnimationActive={false}
                            dataKey="v"
                            name={k.t}
                            stroke={k.c}
                            strokeWidth={2}
                            dot={{ r: 3 }} />
                          
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <h4>Portfolio product mix</h4>
                      <ul className="ceo-modal-break">
                        {productMix.map((p) =>
                      <li
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        key={p.n}>
                        
                            <span>{p.n}</span>
                            <i>
                              <em style={{ width: p.val * 3 + "%", background: p.c }} />
                            </i>
                            <b>{p.p}</b>
                          </li>
                      )}
                      </ul>
                      <Link to="/workspace" search={{ view: info.view }} className="ceo-modal-link">
                        Open in workspace →
                      </Link>
                    </DialogContent>
                  </Dialog>);

            })()}

            <div className="ceo-row r1">
              <Card
                title={
                <>
                    Target vs Actual Disbursement <small>(MTD)</small> <Info className="ceo-info" />
                  </>
                }
                right={<Pill>MTD</Pill>}>
                
                <div className="ceo-stats">
                  <div>
                    <b>₹ 186 Cr</b>
                    <span>Actual</span>
                  </div>
                  <div>
                    <b>₹ 215 Cr</b>
                    <span>Target</span>
                  </div>
                  <div>
                    <b className="amber">86.5%</b>
                    <span>Achievement</span>
                  </div>
                  <div>
                    <b className="blue">₹ 224 Cr</b>
                    <span>Projected</span>
                  </div>
                </div>
                <div className="disbursement-chart" style={{ height: 150 }}>
                  <ResponsiveContainer>
                    <LineChart data={disb} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                      <CartesianGrid stroke={C.grid} vertical={false} />
                      <XAxis
                        dataKey="m"
                        tick={{ fontSize: 9, fill: C.muted }}
                        axisLine={false}
                        tickLine={false} />
                      
                      <YAxis
                        domain={[0, 250]}
                        ticks={[0, 50, 100, 150, 200, 250]}
                        tickFormatter={(v) => v + " Cr"}
                        tick={{ fontSize: 9, fill: C.muted }}
                        axisLine={false}
                        tickLine={false} />
                      
                      <Tooltip />
                      <Line
                        isAnimationActive={false}
                        dataKey="target"
                        stroke={C.red}
                        strokeDasharray="5 4"
                        dot={false}
                        strokeWidth={1.5} />
                      
                      <Line
                        isAnimationActive={false}
                        dataKey="actual"
                        stroke={C.blue}
                        strokeWidth={1.6}
                        dot={{ r: 3, fill: C.blue }} />
                      
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="ceo-legend">
                  <span>
                    <i style={{ background: C.blue }} />
                    Actual
                  </span>
                  <span>
                    <i className="dash" style={{ background: C.red }} />
                    Target
                  </span>
                  <span>
                    <i className="dash" style={{ background: C.blue }} />
                    Projection
                  </span>
                </div>
              </Card>
              <Card
                title="Product Mix & Performance"
                right={
                <Tabs
                  items={["AUM", "Disbursement", "Customers"]}
                  value={mix}
                  onChange={setMix} />

                }>
                
                <div className="ceo-split">
                  <Donut data={productMix} center="₹ 1,248 Cr" sub="Total AUM" />
                  <ul className="ceo-list">
                    {productMix.map((p) =>
                    <li
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      key={p.n}>
                      
                        <i style={{ background: p.c }} />
                        <span>{p.n}</span>
                        <b>{p.p}</b>
                        <em>{p.v}</em>
                      </li>
                    )}
                  </ul>
                </div>
              </Card>
              <Card title="Loan Conversion Funnel" right={<Pill>MTD</Pill>}>
                <div className="ceo-funnel">
                  {[
                  ["Leads", "12,442", "100%", 100, C.blue, 0],
                  ["Login / Application", "8,214", "66%", 82, C.blue, 8],
                  ["Credit", "4,982", "60.6%", 62, "var(--ceo-blue-2)", 16],
                  ["Sanction", "2,914", "58.5%", 50, C.violet, 24],
                  ["Disbursed", "1,618", "55.5%", 40, C.red, 32]].
                  map(([l, n, p, w, c, o]) =>
                  <div
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.currentTarget.click();
                      }
                    }}
                    key={l}>
                    
                      <span
                      className="bar"
                      style={{
                        width: `calc(${w}% - ${o}px)`,
                        marginLeft: o,
                        background: c
                      }}>
                      
                        {l}
                      </span>
                      <b>{n}</b>
                      <em>{p}</em>
                    </div>
                  )}
                </div>
                <div className="ceo-conv">
                  <span>Lead to Disbursal Conversion</span>
                  <b>13.0%</b>
                </div>
              </Card>
            </div>

            <div className="ceo-row r2">
              <Card
                title={
                <>
                    Branch Performance <ChevronDown className="ceo-info" />
                  </>
                }
                right={<Pill>View All</Pill>}>
                
                <Tabs
                  items={["Top Branches", "Top Regions", "Top Zones"]}
                  value={bTab}
                  onChange={setBTab} />
                
                <table className="ceo-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Branch</th>
                      <th>Target</th>
                      <th>Disbursement</th>
                      <th>Achievement</th>
                      <th>Growth</th>
                      <th>Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                    ["Jaipur - VKI", "25", "28.4", "114%", "18%", "96%"],
                    ["Jaipur - Sanganer", "24", "26.2", "110%", "12%", "95%"],
                    ["Udaipur", "18", "18.6", "103%", "9%", "97%"],
                    ["Kota", "15", "16.8", "112%", "14%", "96%"],
                    ["Jodhpur", "14", "17.4", "124%", "20%", "94%"]].
                    map((r, i) =>
                    <tr
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      key={r[0]}>
                      
                        <td>{i + 1}</td>
                        <td>
                          <b>{r[0]}</b>
                        </td>
                        <td>₹ {r[1]} Cr</td>
                        <td>₹ {r[2]} Cr</td>
                        <td className="g">{r[3]}</td>
                        <td className="g">↑ {r[4]}</td>
                        <td>{r[5]}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
              <Card
                title={
                <>
                    Portfolio Quality <ChevronDown className="ceo-info" />
                  </>
                }
                right={<Pill>AUM</Pill>}>
                
                <div className="ceo-split">
                  <Donut data={quality} center="1.8%" sub="NPA" size={100} />
                  <ul className="ceo-list">
                    {quality.map((p) =>
                    <li
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      key={p.n}>
                      
                        <i style={{ background: p.c }} />
                        <span>{p.n}</span>
                        <b>{p.p}</b>
                        <em>{p.v}</em>
                      </li>
                    )}
                  </ul>
                </div>
              </Card>
              <Card
                title={
                <>
                    Collection Performance <ChevronDown className="ceo-info" />
                  </>
                }
                right={<Pill>MTD</Pill>}>
                
                <div className="ceo-stats sm">
                  <div>
                    <b>₹ 164 Cr</b>
                    <span>Due</span>
                  </div>
                  <div>
                    <b>₹ 158 Cr</b>
                    <span>Collected</span>
                  </div>
                  <div>
                    <b>96.4%</b>
                    <span>Efficiency</span>
                  </div>
                  <div>
                    <b>₹ 6 Cr</b>
                    <span className="red">Remaining</span>
                  </div>
                </div>
                <div className="ceo-chart" style={{ height: 100 }}>
                  <ResponsiveContainer>
                    <ComposedChart
                      data={collection}
                      margin={{ top: 4, right: -10, left: -18, bottom: 0 }}>
                      
                      <XAxis
                        dataKey="m"
                        tick={{ fontSize: 9, fill: C.muted }}
                        axisLine={false}
                        tickLine={false} />
                      
                      <YAxis
                        yAxisId="l"
                        ticks={[0, 20, 40, 80]}
                        tickFormatter={(v) => v + " Cr"}
                        tick={{ fontSize: 9, fill: C.muted }}
                        axisLine={false}
                        tickLine={false} />
                      
                      <YAxis
                        yAxisId="r"
                        orientation="right"
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => v + "%"}
                        tick={{ fontSize: 9, fill: C.muted }}
                        axisLine={false}
                        tickLine={false} />
                      
                      <Tooltip />
                      <Bar
                        isAnimationActive={false}
                        yAxisId="l"
                        dataKey="due"
                        fill={C.blue}
                        barSize={7} />
                      
                      <Bar
                        isAnimationActive={false}
                        yAxisId="l"
                        dataKey="col"
                        fill={C.green}
                        barSize={7} />
                      
                      <Line
                        isAnimationActive={false}
                        yAxisId="r"
                        dataKey="eff"
                        stroke={C.red}
                        dot={{ r: 2, fill: C.red }}
                        strokeWidth={1.4} />
                      
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="ceo-legend">
                  <span>
                    <i style={{ background: C.blue }} />
                    Due
                  </span>
                  <span>
                    <i style={{ background: C.green }} />
                    Collected
                  </span>
                  <span>
                    <i className="dash" style={{ background: C.red }} />
                    Efficiency %
                  </span>
                </div>
              </Card>
            </div>

            <div className="ceo-row r3">
              <Card
                title={
                <>
                    Credit Command Center <ChevronDown className="ceo-info" />
                  </>
                }>
                
                <div className="ceo-minis">
                  {[
                  [ClipboardList, "127", "Credit Queue", "blue"],
                  [Clock3, "3.8d", "Avg Credit TAT", "violet"],
                  [FileWarning, "42", "CAM Pending", "amber"],
                  [ShieldAlert, "18", "RCU / Fraud Flags", "red"],
                  [Wrench, "14", "Technical Pending", "teal"],
                  [Gavel, "8", "Legal Pending", "red"]].
                  map(([I, n, l, t]) => {
                    const Ic = I;
                    return (
                      <div
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        key={l}>
                        
                        <span className={"ceo-ic " + t}>
                          <Ic />
                        </span>
                        <div>
                          <b className={t}>{n}</b>
                          <small>{l}</small>
                        </div>
                      </div>);

                  })}
                </div>
                <div className="ceo-credit">
                  <div>
                    <h3>
                      Credit TAT Analysis <small>(Applications)</small>
                    </h3>
                    <div className="ceo-chart" style={{ height: 110 }}>
                      <ResponsiveContainer>
                        <BarChart data={tat} margin={{ top: 16, right: 0, left: 0, bottom: 0 }}>
                          <XAxis
                            dataKey="d"
                            tick={{ fontSize: 9, fill: C.muted }}
                            axisLine={false}
                            tickLine={false} />
                          
                          <Bar
                            isAnimationActive={false}
                            dataKey="v"
                            fill="var(--ceo-blue-3)"
                            barSize={34}>
                            
                            <LabelList
                              dataKey="v"
                              position="top"
                              formatter={(v) => v + "%"}
                              style={{ fontSize: 10, fill: "var(--ceo-ink)" }} />
                            
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3>Risk Grade Distribution</h3>
                    <div className="ceo-split">
                      <Donut data={grades} center="284" sub="Cases" size={70} />
                      <ul className="ceo-legend col">
                        {grades.map((g) =>
                        <li
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.currentTarget.click();
                            }
                          }}
                          key={g.n}>
                          
                            <i style={{ background: g.c }} />
                            {g.n}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
              <Card
                title={
                <>
                    Employee Performance <ChevronDown className="ceo-info" />
                  </>
                }
                right={<Pill>View All</Pill>}>
                
                <Tabs
                  items={["Top Performers", "Bottom Performers", "Team View"]}
                  value={eTab}
                  onChange={setETab} />
                
                <table className="ceo-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>Role</th>
                      <th>Disbursement</th>
                      <th>Target</th>
                      <th>Achievement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                    ["Neha Jain", "BSO", "2.8", "2.5", "112%"],
                    ["Amit Sharma", "BDM", "12.4", "10", "124%"],
                    ["Rakesh Meena", "ASM", "28.1", "25", "112%"],
                    ["Pooja Rathore", "RSM", "36.2", "40", "90%"],
                    ["Manish Gupta", "ZSM", "82.4", "80", "103%"]].
                    map((r, i) =>
                    <tr
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      key={r[0]}>
                      
                        <td>{i + 1}</td>
                        <td>{r[0]}</td>
                        <td>{r[1]}</td>
                        <td>₹ {r[2]} Cr</td>
                        <td>₹ {r[3]} Cr</td>
                        <td className={parseInt(r[4] ?? "0") < 100 ? "r" : "g"}>{r[4]}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
              <Card title="Management Watchlist" right={<Pill>View All</Pill>}>
                <ul className="ceo-watch">
                  {[
                  [AlertTriangle, "High Risk Cases", 18, "CRITICAL"],
                  [AlertOctagon, "SLA Breaches", 27, "HIGH"],
                  [FileClock, "Pending Approvals", 12, "MEDIUM"],
                  [Gavel, "Legal Exceptions", 8, "HIGH"],
                  [Wrench, "Technical Deviations", 14, "MEDIUM"],
                  [Package, "PDD Overdue", 11, "HIGH"],
                  [Cctv, "CCTV Critical Incidents", 2, "MEDIUM"]].
                  map(([I, l, n, s]) => {
                    const Ic = I;
                    return (
                      <li
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        key={l}>
                        
                        <Ic />
                        <span>{l}</span>
                        <b>{n}</b>
                        <em className={s.toLowerCase()}>{s}</em>
                      </li>);

                  })}
                </ul>
              </Card>
            </div>

            <div className="ceo-row r4">
              <Card title="Geographic Business Performance" right={<Pill>Disbursement</Pill>}>
                <div className="ceo-geo">
                  <svg viewBox="0 0 200 110" className="ceo-map">
                    <path
                      d="M70 8l18 6 10-4 8 10 14 2 6 12 16 4 8 14-10 8 4 12-14 6-6 14-16 2-10 12-14-6-8-14-16-4-4-14 6-10-10-10 4-14 12-6z"
                      fill="var(--ceo-blue-soft)" />
                    
                    <path
                      d="M58 30l20-6 14 10-2 16 10 12-10 14-16-2-10-12-12-4 2-14z"
                      fill={C.blue} />
                    
                    <path d="M92 26l18 4 4 12-10 6-12-6z" fill="var(--ceo-blue-2)" />
                    <path d="M78 74l16 2 6 12-14 8-10-8z" fill="var(--ceo-blue-3)" />
                  </svg>
                  <ul className="ceo-list geo">
                    {[
                    ["Rajasthan", "482", "38.6%"],
                    ["North", "312", "25.0%"],
                    ["West", "224", "18.0%"],
                    ["Central", "148", "11.8%"],
                    ["East", "82", "6.6%"]].
                    map(([n, v, p], i) =>
                    <li
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      key={n}>
                      
                        <i style={{ background: i ? "var(--ceo-blue-soft)" : C.blue }} />
                        <span>{n}</span>
                        <em>₹ {v} Cr</em>
                        <b>{p}</b>
                      </li>
                    )}
                  </ul>
                </div>
              </Card>
              <Card title="Assets & Admin Overview" right={<Pill>View All</Pill>}>
                <div className="ceo-tiles">
                  {[
                  [Package, "148", "Asset Requests", "22 Pending", "blue"],
                  [UserCheck, "86", "Assigned Assets", "+5 this month", "teal"],
                  [Receipt, "62", "Admin Requests", "8 Budget Pending", "red"],
                  [Monitor, "14", "Offline Devices", "2 Critical", "violet"]].
                  map(([I, n, l, s, t]) => {
                    const Ic = I;
                    return (
                      <div
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        key={l}>
                        
                        <span className={"ceo-ic " + t}>
                          <Ic />
                        </span>
                        <div>
                          <b>{n}</b>
                          <small>{l}</small>
                          <em className={t}>{s}</em>
                        </div>
                      </div>);

                  })}
                </div>
              </Card>
              <Card title="Governance, Audit & Compliance" right={<Pill>View All</Pill>}>
                <div className="ceo-tiles">
                  {[
                  [ClipboardCheck, "12", "Open Audits", "4 Critical", "blue", "red"],
                  [FileCheck2, "18", "Compliance Due", "6 Overdue", "red", "red"],
                  [Lock, "5", "Consent", "2 High Risk", "red", "muted"],
                  [Award, "96%", "Compliance Score", "↑ 2%", "teal", "teal"]].
                  map(([I, n, l, s, t, st]) => {
                    const Ic = I;
                    return (
                      <div
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        key={l}>
                        
                        <span className={"ceo-ic " + t}>
                          <Ic />
                        </span>
                        <div>
                          <b>{n}</b>
                          <small>{l}</small>
                          <em className={st}>{s}</em>
                        </div>
                      </div>);

                  })}
                </div>
              </Card>
            </div>
            {detail &&
            <Dialog
              open
              onOpenChange={(value) => {
                if (!value) setDetail(null);
              }}>
              
                <DialogContent
                className="ceo-root ceo-modal ceo-section-modal"
                aria-label={detail.title + " details"}>
                
                  <DialogTitle>{detail.title}</DialogTitle>
                  <DialogDescription>
                    Displayed dashboard figures · {period} · Read only
                  </DialogDescription>
                  <div className="ceo-detail-content">{detail.content}</div>
                  <Button variant="ceo" asChild className="ceo-modal-link">
                    <Link to="/workspace" search={{ view: detail.view }}>
                      Open in workspace →
                    </Link>
                  </Button>
                </DialogContent>
              </Dialog>
            }
            <CeoAsk
              metrics={{
                period,
                kpis: kpis.map((k) => ({
                  name: k.t,
                  value: k.v,
                  change: (k.up ? "+" : "-") + k.d
                })),
                disbursementCrByMonth: disb.map((d) => ({
                  month: d.m,
                  actual: d.actual,
                  target: d.target
                })),
                productMix: productMix.map((p) => ({ product: p.n, share: p.p, aum: p.v })),
                portfolioQuality: quality.map((p) => ({ bucket: p.n, share: p.p, amount: p.v })),
                collectionCr: collection,
                approvalTatShare: tat,
                riskGrades: grades.map((g) => ({ grade: g.n, share: g.v }))
              }} />
            
          </div>
        </div>
      </div>
    </DetailContext.Provider>);

}