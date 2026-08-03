import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Activity,
  ScanLine,
  UploadCloud,
  ZoomIn,
  Maximize2,
  X,
  FileText,
  ChevronDown,
  Send,
  Loader2,
  ClipboardList,
  RefreshCw,
  Server,
  UserCog,
  Stethoscope,
  GraduationCap,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/* ============================================================================
   AegisVQA — Secure Multimodal Medical VQA System (OKF + AWS RBAC)
   Design language: dark clinical reading-room chrome, dual accent system
   (teal = standard/active, amber = elevated clearance), monospace data
   readouts for tokens / timestamps / file paths, reticle-framed viewport.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   THEME
--------------------------------------------------------------------------- */
const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .aegis {
    --bg: #0a0f1a;
    --bg-raised: #0d1420;
    --panel: #101a29;
    --panel-alt: #0c1420;
    --border: #1e2c40;
    --border-soft: #16202f;
    --text-1: #e7edf7;
    --text-2: #93a4bd;
    --text-3: #56647c;
    --teal: #2dd4c8;
    --teal-dim: #123a37;
    --teal-glow: rgba(45, 212, 200, 0.35);
    --amber: #e0ac3d;
    --amber-dim: #3a2c10;
    --amber-glow: rgba(224, 172, 61, 0.35);
    --green: #3fd68f;
    --green-dim: #0f3324;
    --red: #f0594c;
    --red-dim: #3a1512;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    background: var(--bg);
    color: var(--text-1);
  }
  .aegis .f-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
  .aegis .f-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

  .aegis .panel { background: var(--panel); border: 1px solid var(--border); }
  .aegis .panel-alt { background: var(--panel-alt); border: 1px solid var(--border-soft); }
  .aegis .divider { border-color: var(--border); }

  .aegis .text-t1 { color: var(--text-1); }
  .aegis .text-t2 { color: var(--text-2); }
  .aegis .text-t3 { color: var(--text-3); }

  .aegis .accent-teal { color: var(--teal); }
  .aegis .accent-amber { color: var(--amber); }
  .aegis .accent-green { color: var(--green); }
  .aegis .accent-red { color: var(--red); }

  .aegis .bg-teal-dim { background: var(--teal-dim); }
  .aegis .bg-amber-dim { background: var(--amber-dim); }
  .aegis .bg-green-dim { background: var(--green-dim); }
  .aegis .bg-red-dim { background: var(--red-dim); }

  .aegis .border-teal { border-color: rgba(45, 212, 200, 0.4); }
  .aegis .border-amber { border-color: rgba(224, 172, 61, 0.45); }
  .aegis .border-green { border-color: rgba(63, 214, 143, 0.4); }

  .aegis .glow-teal { box-shadow: 0 0 0 1px rgba(45,212,200,0.25), 0 0 24px -4px var(--teal-glow); }
  .aegis .glow-amber { box-shadow: 0 0 0 1px rgba(224,172,61,0.3), 0 0 24px -4px var(--amber-glow); }

  .aegis .btn-primary {
    background: linear-gradient(180deg, #2fe0d2, #1fb3a6);
    color: #04211d;
  }
  .aegis .btn-primary:hover { filter: brightness(1.06); }
  .aegis .btn-primary:disabled { opacity: 0.5; filter: none; cursor: not-allowed; }

  .aegis .pill {
    background: var(--panel-alt);
    border: 1px solid var(--border);
    color: var(--text-2);
    transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
  }
  .aegis .pill:hover { border-color: rgba(45,212,200,0.5); color: var(--text-1); background: var(--teal-dim); }

  .aegis .scanline-track { position: relative; overflow: hidden; }
  .aegis .scanline-track::after {
    content: "";
    position: absolute; left: -30%; top: 0; height: 100%; width: 30%;
    background: linear-gradient(90deg, transparent, rgba(45,212,200,0.55), transparent);
    animation: aegis-sweep 3.2s linear infinite;
  }
  @keyframes aegis-sweep { 0% { left: -30%; } 100% { left: 100%; } }

  .aegis .pulse-dot { position: relative; }
  .aegis .pulse-dot::before {
    content: ""; position: absolute; inset: -4px; border-radius: 9999px;
    background: var(--teal); opacity: 0.5;
    animation: aegis-pulse 1.8s ease-out infinite;
  }
  @keyframes aegis-pulse {
    0% { transform: scale(0.6); opacity: 0.55; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  .aegis .reticle { position: relative; }
  .aegis .reticle::before, .aegis .reticle::after,
  .aegis .reticle .rt-tr, .aegis .reticle .rt-bl {
    content: ""; position: absolute; width: 18px; height: 18px;
    border-color: var(--teal); opacity: 0.85;
  }
  .aegis .reticle::before { top: 10px; left: 10px; border-top: 2px solid; border-left: 2px solid; }
  .aegis .reticle::after { bottom: 10px; right: 10px; border-bottom: 2px solid; border-right: 2px solid; }
  .aegis .reticle .rt-tr { top: 10px; right: 10px; border-top: 2px solid var(--teal); border-right: 2px solid var(--teal); }
  .aegis .reticle .rt-bl { bottom: 10px; left: 10px; border-bottom: 2px solid var(--teal); border-left: 2px solid var(--teal); }

  .aegis .fade-in { animation: aegis-fade-in 260ms ease both; }
  @keyframes aegis-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .aegis .slide-in { animation: aegis-slide-in 240ms cubic-bezier(0.2,0.8,0.2,1) both; }
  @keyframes aegis-slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .aegis .spin-slow { animation: spin 1.1s linear infinite; }

  .aegis ::selection { background: rgba(45,212,200,0.3); }

  .aegis .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
  .aegis .scrollbar-thin::-webkit-scrollbar-thumb { background: #1e2c40; border-radius: 8px; }
  .aegis .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
`;

/* ---------------------------------------------------------------------------
   MOCK DATA — OKF markdown "graph files" and sample scans
--------------------------------------------------------------------------- */

const OKF_FILES = {
  "polyps.md": {
    level: 1,
    title: "Colonic Polyps — General Reference",
    content: `---
type: anatomical_reference
region: colon
clearance_level: 1
tags: [polyp, mucosa, adenoma]
---

# Colonic Polyps

A polyp is a localized overgrowth of mucosal tissue projecting into the
colonic lumen. Morphology is commonly graded using the Paris
classification (pedunculated, sessile, flat).

## Key Features
- Pedunculated polyps present with a stalk; sessile polyps are flat-based.
- Adenomatous polyps carry malignant potential and warrant resection.
- Hyperplastic polyps are typically benign, most common in the rectosigmoid.

## Textbook Note
Surveillance interval after polypectomy depends on polyp count, size, and
histology per standard GI society guidelines.`,
  },
  "ulcerative_colitis.md": {
    level: 1,
    title: "Ulcerative Lesions — General Reference",
    content: `---
type: anatomical_reference
region: stomach
clearance_level: 1
tags: [ulcer, gastric, mucosa]
---

# Gastric Ulcerative Lesions

Ulcerative lesions present as mucosal breaks extending through the
muscularis mucosae, often with a fibrinous base and surrounding erythema.

## Key Features
- Depth and border regularity help distinguish benign vs. malignant ulcers.
- Location (lesser curvature, antrum) affects differential diagnosis.
- Biopsy of ulcer margins is standard practice to exclude malignancy.`,
  },
  "normal_z_line.md": {
    level: 1,
    title: "Normal Z-Line — General Reference",
    content: `---
type: anatomical_reference
region: esophagus
clearance_level: 1
tags: [z-line, gastroesophageal-junction, normal]
---

# Normal Squamocolumnar Junction (Z-Line)

The Z-line marks the transition between esophageal squamous epithelium
and gastric columnar epithelium. A regular, sharply demarcated Z-line at
the gastroesophageal junction is a normal finding.

## Key Features
- Irregular or proximally displaced Z-line may indicate Barrett's changes.
- Documentation of Z-line position relative to the diaphragmatic hiatus
  is standard in screening endoscopy.`,
  },
  "differential_diagnosis_gi.md": {
    level: 1,
    title: "GI Differential Diagnosis — Framework",
    content: `---
type: clinical_reference
region: general
clearance_level: 1
tags: [differential, workup]
---

# General Differential Framework for Mucosal Findings

1. Characterize lesion morphology (Paris classification).
2. Consider location-specific differentials.
3. Correlate with biopsy/histology when available.
4. Escalate to follow-up interval per surveillance guidelines.

This file contains no patient-identifiable information and is available
to all clearance levels.`,
  },
  "patient_case_001.md": {
    level: 2,
    title: "Restricted — Patient Case 001",
    content: `---
type: clinical_case
patient_id: PT-00841-GI
clearance_level: 2
restricted: true
tags: [case-history, follow-up]
---

# Patient Case 001 — Clinical History (RESTRICTED)

**Prior finding:** 8mm sessile polyp, ascending colon, resected 2023-11.
**Histology:** Tubular adenoma, low-grade dysplasia, margins clear.
**Follow-up plan:** Surveillance colonoscopy at 3 years per histology.

## Attending Notes
Patient reports intermittent lower-quadrant discomfort, no rectal
bleeding. Family history of colorectal neoplasia (mother, age 61).
Recommend correlating current scan against 2023 baseline imagery.`,
  },
  "patient_case_002.md": {
    level: 2,
    title: "Restricted — Patient Case 002",
    content: `---
type: clinical_case
patient_id: PT-01123-GI
clearance_level: 2
restricted: true
tags: [case-history, biopsy]
---

# Patient Case 002 — Clinical History (RESTRICTED)

**Prior finding:** Gastric ulcer, lesser curvature, biopsied 2024-02.
**Histology:** Benign, H. pylori negative.
**Follow-up plan:** Repeat EGD in 8 weeks to confirm healing.

## Attending Notes
Consider comparative assessment of ulcer margin regularity against this
prior case when evaluating new gastric lesions.`,
  },
};

const SAMPLE_IMAGES = [
  {
    id: "polyp",
    label: "Polyp Detection",
    sub: "Colonic Mucosa",
    filename: "colonoscopy_scan_04.jpg",
    region: "colon",
    palette: ["#5a2e2e", "#8a4a3a", "#c97b52"],
  },
  {
    id: "ulcer",
    label: "Ulcerative Lesion",
    sub: "Gastric",
    filename: "gastric_scan_11.jpg",
    region: "stomach",
    palette: ["#4a2a1e", "#7a3d28", "#d68a4a"],
  },
  {
    id: "zline",
    label: "Normal Z-Line",
    sub: "Esophagus",
    filename: "esophagus_scan_02.jpg",
    region: "esophagus",
    palette: ["#3a2436", "#6b3d52", "#c76b8a"],
  },
];

const QUERY_PRESETS = [
  "Identify abnormal mucosal findings",
  "Suggest differential diagnosis & follow-up",
  "Compare against historical patient cases",
];

const ROLES = {
  student: {
    id: "student",
    label: "Medical Student",
    sub: "Level 1 Clearance",
    level: 1,
    token: mockJwt("student", 1), // <--- Valid JWT token
    icon: GraduationCap,
  },
  doctor: {
    id: "doctor",
    label: "Attending Physician",
    sub: "Level 2 Clearance",
    level: 2,
    token: mockJwt("doctor", 2), // <--- Valid JWT token
    icon: Stethoscope,
  },
};

function mockJwt(seed, level = 1) {
  const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/=+$/, "");
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64(
    JSON.stringify({
      sub: seed,
      "custom:clearance_level": level, // <--- Added clearance level to JWT
      email: seed === "doctor" ? "dr.hallow@aegis.health" : "student.k@aegis.health",
      iat: 1732600000,
      iss: "aegisvqa-aws",
    })
  );
  return `${header}.${payload}.mockSignature_${seed.toLowerCase()}`;
}



/* ---------------------------------------------------------------------------
   API LAYER — /mnt-equivalent of api.js, inlined for this artifact.
   Real backend call first; falls back to realistic mock on any failure so
   the UI keeps working offline.
--------------------------------------------------------------------------- */

// In an actual Vite project, replace this line with:
//   const API_BASE_URL = import.meta.env.VITE_AWS_API_URL || "YOUR_AWS_API_GATEWAY_INVOKE_URL";
// import.meta.env is Vite-only, so it's swapped for a plain constant in this
// preview environment; the fetch below still calls the real endpoint shape.
const API_BASE_URL = import.meta.env.VITE_AWS_API_URL || "https://07tv0tw8fd.execute-api.ap-southeast-2.amazonaws.com/prod";

async function analyzeScan({ query, imageUrl, jwtToken, clearanceLevel = 1 }) {
  const cleanBaseUrl = (import.meta.env.VITE_AWS_API_URL || API_BASE_URL).replace(/\/+$/, '');
  
  const res = await fetch(`${cleanBaseUrl}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      query,
      image_url: imageUrl,
      clearance_level: clearanceLevel
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AWS Error [${res.status}]: ${errText}`);
  }

  // Parse initial JSON response
  let data = await res.json();

  // If Lambda returned an API Gateway proxy wrapper, parse inner body
  if (data.body && typeof data.body === "string") {
    data = JSON.parse(data.body);
  }

  // Ensure structure expected by React UI
  return {
    analysis: data.answer || data.analysis || "No response text generated.",
    clearanceLevel: data.user_clearance || data.clearanceLevel || 1,
    sources: data.sources || []
  };
}

async function mockAnalyze({ query, image, clearanceLevel }) {
  await new Promise((r) => setTimeout(r, 1400 + Math.random() * 500));

  const regionFiles = {
    colon: ["polyps.md", "differential_diagnosis_gi.md"],
    stomach: ["ulcerative_colitis.md", "differential_diagnosis_gi.md"],
    esophagus: ["normal_z_line.md", "differential_diagnosis_gi.md"],
  };
  const restrictedFiles = {
    colon: ["patient_case_001.md"],
    stomach: ["patient_case_002.md"],
    esophagus: [],
  };

  const region = image?.region || "colon";
  let sources = [...(regionFiles[region] || [])];
  const wantsHistory = /histor|compar|prior|previous case/i.test(query);

  if (clearanceLevel >= 2 && (wantsHistory || Math.random() > 0.4)) {
    sources = [...sources, ...(restrictedFiles[region] || [])];
  }

  const analyses = {
    colon: {
      base: `Mucosal survey of the colonic segment identifies a sessile lesion measuring approximately 6-9mm, consistent with Paris classification 0-Is morphology. Surface pit pattern suggests adenomatous histology; overlying vascularity is mildly increased with no stigmata of active bleeding.`,
      diff: `Primary differential favors tubular adenoma. Alternative considerations include hyperplastic polyp (lower malignant potential) and, less likely given morphology, a serrated lesion. Recommend biopsy or polypectomy with histopathological confirmation.`,
      restricted: `Cross-referencing prior surveillance history for this patient: a similar sessile lesion was resected previously with low-grade dysplasia on histology. Current finding should be evaluated against the 3-year surveillance interval established at that time.`,
    },
    stomach: {
      base: `A mucosal break is identified along the lesser curvature with a fibrinous base and mild surrounding erythema, measuring roughly 10-14mm. Borders appear regular without heaped or irregular margins.`,
      diff: `Findings are most consistent with a benign gastric ulcer. Malignant ulceration remains a differential given location; biopsy of the margin is recommended to exclude malignancy, along with H. pylori testing.`,
      restricted: `This patient has a documented prior gastric ulcer at a similar location, previously confirmed benign and H. pylori negative. Current appearance should be compared against the prior healing trajectory before finalizing follow-up interval.`,
    },
    esophagus: {
      base: `The squamocolumnar junction (Z-line) is visualized at the expected level relative to the diaphragmatic hiatus. The transition is regular and sharply demarcated circumferentially, with no tongues of columnar-appearing mucosa extending proximally.`,
      diff: `Findings are within normal limits. No endoscopic features suggestive of Barrett's esophagus or erosive changes are identified. Routine screening interval applies.`,
      restricted: `No restricted clinical history is associated with a normal finding of this type for this patient record.`,
    },
  };

  const a = analyses[region] || analyses.colon;
  let text = `${a.base}\n\n${a.diff}`;
  const hasRestricted = (restrictedFiles[region] || []).some((f) => sources.includes(f));
  if (hasRestricted) {
    text += `\n\n${a.restricted}`;
  }

  return {
    analysis: text,
    clearanceLevel,
    sources,
    query,
  };
}

async function fetchAuditLogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/logs`);
    if (!res.ok) throw new Error("Failed to fetch logs");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error pulling audit logs from AWS:", err);
    return null;
  }
}

/* ---------------------------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------------------------- */

function Badge({ children, tone = "teal", className = "" }) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-dim border-amber accent-amber"
      : tone === "green"
      ? "bg-green-dim border-green accent-green"
      : tone === "red"
      ? "bg-red-dim accent-red"
      : "bg-teal-dim border-teal accent-teal";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs f-mono ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}

function ScanPlaceholder({ palette, className = "" }) {
  const [a, b, c] = palette;
  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`g-${a}`} cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor={c} />
          <stop offset="55%" stopColor={b} />
          <stop offset="100%" stopColor={a} />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="#050708" />
      <circle cx="180" cy="140" r="150" fill={`url(#g-${a})`} opacity="0.9" />
      <ellipse cx="150" cy="110" rx="60" ry="34" fill="#000" opacity="0.18" />
      <ellipse cx="230" cy="180" rx="80" ry="46" fill="#000" opacity="0.14" />
      <circle cx="180" cy="140" r="150" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="30" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   HEADER
--------------------------------------------------------------------------- */

function Header({ role, setRole, onOpenAudit }) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const RoleIcon = role.icon;

  return (
    <header className="panel border-b divider">
      <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-teal-dim border border-teal flex items-center justify-center scanline-track">
            <ScanLine size={18} className="accent-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="f-display font-semibold text-[15px] tracking-tight text-t1">AegisVQA</h1>
              <span className="hidden sm:inline-block h-3 w-px bg-[var(--border)]" />
              <span className="hidden sm:inline text-xs text-t3">Secure Multimodal GI Diagnostics</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
              <span className="text-[11px] f-mono accent-teal">AWS Serverless Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-t3 f-mono">
            <Server size={13} />
            <span>us-east-1 · api-gateway · healthy</span>
          </div>

          <button
            onClick={onOpenAudit}
            className="pill hidden sm:flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
          >
            <ClipboardList size={14} />
            View Audit Logs
          </button>

          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium ${
                role.level === 2 ? "bg-amber-dim border-amber accent-amber" : "bg-teal-dim border-teal accent-teal"
              }`}
            >
              <RoleIcon size={14} />
              <span className="hidden sm:inline">{role.label}</span>
              <span className="f-mono text-[10px] opacity-70 hidden md:inline">· {role.sub}</span>
              <ChevronDown size={13} className={`transition-transform ${roleMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 panel rounded-lg shadow-2xl overflow-hidden z-30 fade-in">
                {Object.values(ROLES).map((r) => {
                  const Icon = r.icon;
                  const active = r.id === role.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 text-left border-b divider last:border-b-0 hover:bg-[var(--panel-alt)] ${
                        active ? "bg-[var(--panel-alt)]" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                          r.level === 2 ? "bg-amber-dim border-amber accent-amber" : "bg-teal-dim border-teal accent-teal"
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-t1 font-medium">{r.label}</div>
                        <div className="text-[11px] text-t3 f-mono">{r.sub}</div>
                      </div>
                      {active && <CheckCircle2 size={15} className="accent-teal" />}
                    </button>
                  );
                })}
                <div className="px-3.5 py-2.5 text-[10px] f-mono text-t3 bg-[var(--panel-alt)]">
                  Bearer token rotates automatically on role switch.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
   LEFT PANEL — SCAN WORKSPACE
--------------------------------------------------------------------------- */

function ScanWorkspace({ selectedImage, setSelectedImage, onOpenSourceDrawer }) {
  const [dragActive, setDragActive] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage({
        id: "upload-" + Date.now(),
        label: "Uploaded Scan",
        sub: "Custom Upload",
        filename: file.name,
        region: "colon",
        customUrl: url,
        palette: ["#2a2a3a", "#4a4a6a", "#7a7ab2"],
      });
    }
  }, [setSelectedImage]);

  return (
    <div className="panel rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b divider flex items-center justify-between">
        <h2 className="f-display text-sm font-semibold text-t1 flex items-center gap-2">
          <FileSearch size={15} className="accent-teal" />
          Endoscopy Scan Workspace
        </h2>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`rounded-lg border-2 border-dashed px-4 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragActive ? "border-teal bg-teal-dim" : "border-[var(--border)] hover:border-teal"
          }`}
        >
          <UploadCloud size={22} className={dragActive ? "accent-teal" : "text-t3"} />
          <p className="text-xs text-t2 text-center">
            Drag &amp; drop a <span className="f-mono">.png</span> / <span className="f-mono">.jpg</span> endoscopy scan
          </p>
          <span className="text-[11px] text-t3">or click to browse</span>
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setSelectedImage({
                  id: "upload-" + Date.now(),
                  label: "Uploaded Scan",
                  sub: "Custom Upload",
                  filename: file.name,
                  region: "colon",
                  customUrl: url,
                  palette: ["#2a2a3a", "#4a4a6a", "#7a7ab2"],
                });
              }
            }}
          />
        </div>

        {/* Sample gallery */}
        <div>
          <p className="text-[11px] uppercase tracking-wide text-t3 mb-2 f-mono">Sample Scan Gallery</p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_IMAGES.map((img) => {
              const active = selectedImage?.id === img.id;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`group rounded-lg overflow-hidden border text-left transition-colors ${
                    active ? "border-teal glow-teal" : "border-[var(--border)] hover:border-teal"
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <ScanPlaceholder palette={img.palette} className="w-full h-full" />
                  </div>
                  <div className="px-1.5 py-1.5 panel-alt">
                    <div className="text-[11px] text-t1 font-medium leading-tight">{img.label}</div>
                    <div className="text-[10px] text-t3 leading-tight">{img.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview window */}
        {selectedImage && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-t3 mb-2 f-mono">Image Preview</p>
            <div className="reticle rounded-lg overflow-hidden border border-[var(--border)] relative bg-black">
              <span className="rt-tr" />
              <span className="rt-bl" />
              <div className={`w-full ${zoomed ? "aspect-square" : "aspect-video"} transition-all overflow-hidden`}>
                {selectedImage.customUrl ? (
                  <img src={selectedImage.customUrl} alt={selectedImage.filename} className="w-full h-full object-cover" />
                ) : (
                  <ScanPlaceholder
                    palette={selectedImage.palette}
                    className={`w-full h-full ${zoomed ? "scale-125" : "scale-100"} transition-transform duration-300`}
                  />
                )}
              </div>

              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => setZoomed((v) => !v)}
                  className="w-7 h-7 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-t1 hover:bg-black/80"
                  title="Toggle zoom"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={() => setFullscreen(true)}
                  className="w-7 h-7 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-t1 hover:bg-black/80"
                  title="Full screen"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge tone="teal">Resolution: 1080p</Badge>
              <Badge tone="teal" className="max-w-full">
                <span className="truncate">{selectedImage.filename}</span>
              </Badge>
              <Badge tone="teal">Region: {selectedImage.region}</Badge>
            </div>
          </div>
        )}
      </div>

      {fullscreen && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 fade-in"
          onClick={() => setFullscreen(false)}
        >
          <button className="absolute top-5 right-5 text-t1 hover:accent-teal" onClick={() => setFullscreen(false)}>
            <X size={22} />
          </button>
          <div className="max-w-3xl w-full aspect-video rounded-lg overflow-hidden reticle border border-[var(--border)]">
            <span className="rt-tr" />
            <span className="rt-bl" />
            {selectedImage.customUrl ? (
              <img src={selectedImage.customUrl} alt="" className="w-full h-full object-contain bg-black" />
            ) : (
              <ScanPlaceholder palette={selectedImage.palette} className="w-full h-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   RIGHT PANEL — DIAGNOSTIC VQA CONSOLE
--------------------------------------------------------------------------- */

function DiagnosticOutput({ result, role, onOpenSource }) {
  if (!result) return null;
  const isL2 = result.clearanceLevel >= 2;

  // Ensure sources is safely an array even if Lambda returns undefined or null
  const sourceFiles = Array.isArray(result.sources) 
    ? result.sources 
    : (result.sources ? [result.sources] : []);

  return (
    <div className="panel-alt rounded-lg border divider p-4 fade-in space-y-3">
      <div
        className={`rounded-md px-3 py-2 flex items-center gap-2 text-xs font-medium border ${
          isL2 ? "bg-amber-dim border-amber accent-amber" : "bg-green-dim border-green accent-green"
        }`}
      >
        {isL2 ? <Unlock size={14} /> : <ShieldCheck size={14} />}
        {isL2
          ? "Access Granted: Level 2 Restricted Files Unlocked"
          : "Access Granted: Level 1 General Reference Only"}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-t3 mb-1.5 f-mono">AI Analysis</p>
        <p className="text-sm text-t1 leading-relaxed whitespace-pre-line">
          {typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.analysis)}
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-t3 mb-1.5 f-mono">
          Traceable Sources (OKF Files)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sourceFiles.length === 0 ? (
            <span className="text-xs text-t3">No sources cited for this query.</span>
          ) : (
            sourceFiles.map((file) => {
              const meta = OKF_FILES[file] || { level: 1, title: file };
              const restricted = meta?.level === 2;
              return (
                <button
                  key={file}
                  onClick={() => onOpenSource(file)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] f-mono transition-colors ${
                    restricted
                      ? "bg-amber-dim border-amber accent-amber hover:brightness-110"
                      : "bg-teal-dim border-teal accent-teal hover:brightness-110"
                  }`}
                >
                  {restricted ? <Lock size={11} /> : <FileText size={11} />}
                  {file}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function VQAConsole({ selectedImage, role, jwtToken, log, onOpenSource }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async (q) => {
    const finalQuery = q ?? query;
    if (!finalQuery.trim() || !selectedImage) return;
    setLoading(true);
    setError(null);
    console.log("Current Selected Role Level:", role.level);
    try {
      const data = await analyzeScan({
        query: finalQuery,
        imageUrl: selectedImage.customUrl || selectedImage.filename,
        image: selectedImage,
        jwtToken,
        clearanceLevel: role.level,
      });
      setResult(data);
      log({
        userId: role.id === "doctor" ? "dr.hallow@aegis.health" : "student.k@aegis.health",
        clearanceLevel: role.level,
        query: finalQuery,
        sources: data.sources,
      });
    } catch (e) {
      setError("Analysis failed — check AWS API Gateway connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b divider flex items-center justify-between">
        <h2 className="f-display text-sm font-semibold text-t1 flex items-center gap-2">
          <Activity size={15} className="accent-teal" />
          Diagnostic VQA Console
        </h2>
        <Badge tone={role.level === 2 ? "amber" : "teal"}>
          {role.level === 2 ? <Unlock size={11} /> : <ShieldCheck size={11} />}
          L{role.level} Session
        </Badge>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin flex-1">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-t3 mb-2 f-mono">Quick Query Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {QUERY_PRESETS.map((p) => (
              <button key={p} onClick={() => setQuery(p)} className="pill rounded-full px-3 py-1.5 text-xs">
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedImage
                ? "Ask about the current scan (e.g. differential diagnosis, mucosal findings)…"
                : "Select or upload a scan to begin…"
            }
            disabled={!selectedImage}
            rows={3}
            className="w-full panel-alt rounded-lg border divider px-3 py-2.5 text-sm text-t1 placeholder:text-t3 outline-none focus:border-teal resize-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] f-mono text-t3 truncate">
              Bearer&nbsp;
              <span className="accent-teal">{jwtToken.slice(0, 22)}…</span>
            </span>
            <button
              onClick={() => runAnalysis()}
              disabled={!selectedImage || !query.trim() || loading}
              className="btn-primary flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold shrink-0"
            >
              {loading ? <Loader2 size={14} className="spin-slow" /> : <Send size={14} />}
              {loading ? "Analyzing…" : "Analyze Scan"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-dim border border-[rgba(240,89,76,0.4)] accent-red text-xs px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={13} />
            {error}
          </div>
        )}

        {loading && (
          <div className="panel-alt rounded-lg border divider p-4 flex items-center gap-3 fade-in">
            <Loader2 size={16} className="spin-slow accent-teal" />
            <span className="text-xs text-t2 f-mono">
              Querying OKF graph · filtering by clearance_level ≤ {role.level} · invoking Gemini 1.5…
            </span>
          </div>
        )}

        <DiagnosticOutput result={result} role={role} onOpenSource={onOpenSource} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CITATION SOURCE DRAWER
--------------------------------------------------------------------------- */

function SourceDrawer({ file, onClose }) {
  if (!file) return null;
  const meta = OKF_FILES[file];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md h-full panel border-l divider slide-in flex flex-col">
        <div className="px-4 py-3 border-b divider flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {meta.level === 2 ? (
              <Lock size={15} className="accent-amber shrink-0" />
            ) : (
              <FileText size={15} className="accent-teal shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-t1 font-medium truncate">{meta.title}</p>
              <p className="text-[11px] text-t3 f-mono truncate">{file}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-t3 hover:text-t1 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 py-2 border-b divider">
          <Badge tone={meta.level === 2 ? "amber" : "teal"}>
            clearance_level: {meta.level}
            {meta.level === 2 ? " · restricted" : ""}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          <pre className="f-mono text-[12.5px] leading-relaxed text-t2 whitespace-pre-wrap">{meta.content}</pre>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   AUDIT LOG MODAL
--------------------------------------------------------------------------- */

function AuditLogModal({ open, onClose, logs, onRefresh, refreshing }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full panel border-l divider slide-in flex flex-col">
        <div className="px-4 py-3 border-b divider flex items-center justify-between">
          <h3 className="f-display text-sm font-semibold text-t1 flex items-center gap-2">
            <ClipboardList size={15} className="accent-teal" />
            Audit Logs
            <span className="text-[10px] f-mono text-t3 font-normal">DynamoDB · /logs</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="pill flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs"
            >
              <RefreshCw size={12} className={refreshing ? "spin-slow" : ""} />
              Refresh Logs
            </button>
            <button onClick={onClose} className="text-t3 hover:text-t1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="panel-alt sticky top-0">
              <tr className="text-t3 f-mono uppercase text-[10px]">
                <th className="text-left font-medium px-3 py-2.5">Timestamp</th>
                <th className="text-left font-medium px-3 py-2.5">User ID</th>
                <th className="text-left font-medium px-3 py-2.5">Clearance</th>
                <th className="text-left font-medium px-3 py-2.5">Query</th>
                <th className="text-left font-medium px-3 py-2.5">Sources</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-t3 py-8">
                    No queries logged yet this session.
                  </td>
                </tr>
              )}
              {logs.map((l, i) => (
                <tr key={i} className="border-b divider hover:bg-[var(--panel-alt)]">
                  <td className="px-3 py-2.5 f-mono text-t3 whitespace-nowrap">{l.timestamp}</td>
                  <td className="px-3 py-2.5 f-mono text-t2 whitespace-nowrap">{l.userId}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={l.clearanceLevel === 2 ? "amber" : "teal"}>L{l.clearanceLevel}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-t1 max-w-[200px] truncate" title={l.query}>
                    {l.query}
                  </td>
                  <td className="px-3 py-2.5 f-mono text-t3 max-w-[160px] truncate" title={l.sources.join(", ")}>
                    {l.sources.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------------------- */

export default function App() {
  const [role, setRoleState] = useState(ROLES.student);
  const [jwtToken, setJwtToken] = useState(mockJwt(ROLES.student.token));
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0]);
  const [sourceFile, setSourceFile] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([
    {
      timestamp: "2026-07-27 08:12:03",
      userId: "student.k@aegis.health",
      clearanceLevel: 1,
      query: "Identify abnormal mucosal findings",
      sources: ["polyps.md", "differential_diagnosis_gi.md"],
    },
  ]);

  const setRole = (r) => {
    setRoleState(r);
    setJwtToken(mockJwt(r.token));
  };

  const addLog = ({ userId, clearanceLevel, query, sources }) => {
    setLogs((prev) => [
      {
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId,
        clearanceLevel,
        query,
        sources,
      },
      ...prev,
    ]);
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    const liveLogs = await fetchAuditLogs();
    if (liveLogs && Array.isArray(liveLogs)) {
      // Map DynamoDB fields to matches your UI table columns
      const formatted = liveLogs.map((item) => ({
        timestamp: item.timestamp || new Date().toISOString(),
        userId: item.user_id || "unknown",
        clearanceLevel: item.clearance_level || 1,
        query: item.query || "",
        sources: item.accessed_sources || [],
      }));
      setLogs(formatted);
    }
    setRefreshing(false);
  };

  return (
    <div className="aegis min-h-screen w-full">
      <style>{THEME}</style>
      <Header role={role} setRole={setRole} onOpenAudit={() => setAuditOpen(true)} />

      <main className="max-w-[1400px] mx-auto px-5 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch" style={{ minHeight: "640px" }}>
          <ScanWorkspace selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
          <VQAConsole
            selectedImage={selectedImage}
            role={role}
            jwtToken={jwtToken}
            log={addLog}
            onOpenSource={setSourceFile}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-t3 f-mono">
          <UserCog size={12} />
          RBAC filtering occurs server-side before OKF context reaches the model — the client only renders what the
          API returns for the active session.
        </div>
      </main>

      <SourceDrawer file={sourceFile} onClose={() => setSourceFile(null)} />
      <AuditLogModal open={auditOpen} onClose={() => setAuditOpen(false)} logs={logs} onRefresh={refreshLogs} refreshing={refreshing} />
    </div>
  );
}