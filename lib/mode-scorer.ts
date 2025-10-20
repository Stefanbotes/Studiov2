
// Tier-1 probabilistic mode scorer for Studio.
// - Canonical keys: clinical_id in snake_case; mode_id also snake_case.
// - Coping estimator from YSQ via coping_map.
// - Stable softmax with temperature.
// - Explanations: top schema contributions + coping/gate lifts.
// - Optional CSV loaders (no external deps).

import fs from "fs";
import path from "path";

/** -------- Types -------- */

export type ClinicalId = string; // e.g., "emotional_inhibition"
export type ModeId = string;     // e.g., "detached_protector"

export type Gates =
  Partial<Record<"intimacy" | "evaluation" | "limits" | "competition" | "rule", number>>;

export interface BaseWeights { // w_base[mode][clinical_id] = weight
  [modeId: ModeId]: Partial<Record<ClinicalId, number>>;
}

export interface CopingLifts { // per-mode lifts for S/A/O
  [modeId: ModeId]: { S: number; A: number; O: number };
}

export interface ContextLifts { // per-mode gate deltas
  [modeId: ModeId]: Partial<Record<string, number>>;
}

export interface CopingMapRow {
  family: "S" | "A" | "O";
  clinical_id: ClinicalId;
  weight: number;
}

export interface ModeScorerConfig {
  wBase: BaseWeights;
  wCoping: CopingLifts;
  wContext?: ContextLifts;
  tau?: number;                 // temperature for softmax over modes (default 1.5)
  copingTau?: number;           // temperature for coping softmax (default 1.25)
  clipNegSchemasForCoping?: boolean; // clip negatives to 0 when building S/A/O (default true)
  knownClinicalIds?: Set<ClinicalId>; // optional validation
  knownModeIds?: Set<ModeId>;         // optional validation
}

export interface ScoreInputs {
  z: Record<ClinicalId, number>; // standardized schema scores
  gates?: Gates;                  // context inputs in [0,1]
}

export interface ModeDetail {
  mode: ModeId;
  p: number;
  contrib: Array<{ clinical_id: ClinicalId; score: number }>;
  copingLift: { S: number; A: number; O: number };
  gateLift: number;
}

export interface ModeScore {
  coping: {
    cS: number; cA: number; cO: number;
    raw: { S: number; A: number; O: number };
  };
  modes: ModeDetail[];
  tau: number;
  entropy: number;   // predictive uncertainty (nats)
  top2Gap: number;   // p1 - p2
}

/** -------- Math utils -------- */

const EPS = 1e-12;

function stableSoftmax(vals: number[], tau: number): number[] {
  const t = Math.max(0.1, tau);
  const scaled = vals.map(v => v / t);
  const maxV = Math.max(...scaled);
  const exps = scaled.map(v => Math.exp(v - maxV));
  const sum = exps.reduce((a, b) => a + b, 0) + EPS;
  return exps.map(e => e / sum);
}

function entropy(ps: number[]): number {
  return -ps.reduce((acc, p) => acc + (p > 0 ? p * Math.log(p) : 0), 0);
}

/** -------- Coping estimator -------- */

export function estimateCoping(
  z: Record<ClinicalId, number>,
  map: CopingMapRow[],
  opts?: { clipNeg?: boolean; tau?: number }
) {
  const clipNeg = opts?.clipNeg ?? true;
  const tau = opts?.tau ?? 1.25;

  const agg = { S: 0, A: 0, O: 0 };
  for (const row of map) {
    const v = z[row.clinical_id] ?? 0;
    const val = clipNeg ? Math.max(0, v) : v;
    agg[row.family] += (row.weight ?? 0) * val;
  }
  const ps = stableSoftmax([agg.S, agg.A, agg.O], tau);
  return {
    raw: { S: agg.S, A: agg.A, O: agg.O },
    cS: ps[0], cA: ps[1], cO: ps[2],
  };
}

/** -------- Main scorer -------- */

export function scoreFromConfig(
  inputs: ScoreInputs,
  config: ModeScorerConfig,
  copingMap: CopingMapRow[]
): ModeScore {
  const { z, gates = {} } = inputs;
  const tau = config.tau ?? 1.5;

  // Optional upfront validation (no-ops if sets not provided)
  if (config.knownClinicalIds) {
    for (const k of Object.keys(z)) {
      if (!config.knownClinicalIds.has(k)) {
        throw new Error(`Unknown clinical_id in z: "${k}" (add to schema_index or normalize keys).`);
      }
    }
  }

  // 1) Coping
  const coping = estimateCoping(z, copingMap, {
    clipNeg: config.clipNegSchemasForCoping ?? true,
    tau: config.copingTau ?? 1.25,
  });

  // 2) Logits per mode (base + coping lifts + context gates)
  const modeIds = Object.keys(config.wBase);
  if (config.knownModeIds) {
    for (const m of modeIds) {
      if (!config.knownModeIds.has(m)) {
        throw new Error(`Unknown mode_id in wBase: "${m}" (must exist in modes catalog).`);
      }
    }
  }

  const etas: number[] = [];
  const details: Array<Pick<ModeDetail, "contrib" | "copingLift" | "gateLift">> = [];

  for (const m of modeIds) {
    // Extract bias term (intercept)
    const baseRow = config.wBase[m] || {};
    const bias = (baseRow as any)["_bias_"] ?? 0;
    
    let eta = bias; // start from intercept
    const contrib: Array<{ clinical_id: ClinicalId; score: number }> = [];

    // Base schema influence (skip _bias_)
    for (const [cid, w] of Object.entries(baseRow)) {
      if (cid === "_bias_") continue;
      const score = (w ?? 0) * (z[cid] ?? 0);
      eta += score;
      if (Math.abs(score) > 1e-6) {
        contrib.push({ clinical_id: cid, score });
      }
    }

    // Coping lifts
    const lifts = config.wCoping[m] || { S: 0, A: 0, O: 0 };
    const cS = (lifts.S ?? 0) * coping.cS;
    const cA = (lifts.A ?? 0) * coping.cA;
    const cO = (lifts.O ?? 0) * coping.cO;
    const copingLiftSum = cS + cA + cO;
    eta += copingLiftSum;

    // Context gates
    let gateLift = 0;
    const gSpec = (config.wContext && config.wContext[m]) || {};
    for (const [g, delta] of Object.entries(gSpec)) {
      const x = gates[g as keyof Gates] ?? 0;
      gateLift += (delta ?? 0) * x;
    }
    eta += gateLift;

    etas.push(eta);
    details.push({
      contrib: contrib.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 5),
      copingLift: { S: cS, A: cA, O: cO },
      gateLift,
    });
  }

  // 3) Probabilities + diagnostics
  const ps = stableSoftmax(etas, tau);
  const order = ps.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p).map(o => o.i);
  const top2Gap = ps.length >= 2 ? ps[order[0]] - ps[order[1]] : ps[order[0]];

  const modes: ModeDetail[] = order.map(i => ({
    mode: modeIds[i],
    p: ps[i],
    contrib: details[i].contrib,
    copingLift: details[i].copingLift,
    gateLift: details[i].gateLift,
  }));

  return {
    coping: { cS: coping.cS, cA: coping.cA, cO: coping.cO, raw: coping.raw },
    modes,
    tau,
    entropy: entropy(ps),
    top2Gap,
  };
}

/** -------- CSV loading (optional) --------
 * Directory layout (all optional except those you use):
 * - schema_index.csv        clinical_id,display_name,alias
 * - weights_base.csv        mode_id,clinical_id,weight
 * - weights_coping.csv      mode_id,family,lift
 * - weights_context.csv     mode_id,gate_id,delta
 * - coping_map.csv          family,clinical_id,weight
 *
 * Notes:
 * - Minimal CSV parser supports commas inside quotes; no multi-line fields.
 * - Validates that referenced ids exist if schema_index is provided.
 */

export interface LoadedConfig {
  config: ModeScorerConfig;
  copingMap: CopingMapRow[];
}

export function loadConfigFromDir(dir: string): LoadedConfig {
  const readMaybe = (file: string) => {
    const p = path.join(dir, file);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  };

  const schemaIndexCsv = readMaybe("schema_index.csv");
  const baseCsv = readMaybe("weights_base.csv");
  const copingCsv = readMaybe("weights_coping.csv");
  const contextCsv = readMaybe("weights_context.csv");
  const copingMapCsv = readMaybe("coping_map.csv");

  if (!baseCsv) throw new Error(`Missing weights_base.csv in ${dir}`);
  if (!copingCsv) throw new Error(`Missing weights_coping.csv in ${dir}`);
  if (!copingMapCsv) throw new Error(`Missing coping_map.csv in ${dir}`);

  const knownClinicalIds = schemaIndexCsv
    ? new Set(parseCsv(schemaIndexCsv).map(r => normId(r["clinical_id"])))
    : undefined;

  const wBase: BaseWeights = {};
  for (const r of parseCsv(baseCsv)) {
    const mode = normId(r["mode_id"]);
    const cid = normId(r["clinical_id"]);
    const weight = num(r["weight"]);
    if (!wBase[mode]) wBase[mode] = {};
    wBase[mode][cid] = weight;
    const isBias = cid === "_bias_";
    if (!isBias && knownClinicalIds && !knownClinicalIds.has(cid)) {
      throw new Error(`weights_base.csv references unknown clinical_id: ${cid}`);
    }
  }

  const wCoping: CopingLifts = {};
  for (const r of parseCsv(copingCsv)) {
    const mode = normId(r["mode_id"]);
    const fam = (r["family"] || "").trim().toUpperCase();
    const lift = num(r["lift"]);
    if (!wCoping[mode]) wCoping[mode] = { S: 0, A: 0, O: 0 };
    if (fam !== "S" && fam !== "A" && fam !== "O") {
      throw new Error(`weights_coping.csv invalid family: ${fam}`);
    }
    (wCoping[mode] as any)[fam] = lift;
  }

  const wContext: ContextLifts | undefined = contextCsv ? {} : undefined;
  if (contextCsv && wContext) {
    for (const r of parseCsv(contextCsv)) {
      const mode = normId(r["mode_id"]);
      const gate = normId(r["gate_id"]);
      const delta = num(r["delta"]);
      if (!wContext[mode]) wContext[mode] = {};
      wContext[mode][gate] = delta;
    }
  }

  const copingMap: CopingMapRow[] = parseCsv(copingMapCsv).map(r => {
    const fam = (r["family"] || "").trim().toUpperCase();
    if (fam !== "S" && fam !== "A" && fam !== "O") {
      throw new Error(`coping_map.csv invalid family: ${fam}`);
    }
    const cid = normId(r["clinical_id"]);
    if (knownClinicalIds && !knownClinicalIds.has(cid)) {
      throw new Error(`coping_map.csv references unknown clinical_id: ${cid}`);
    }
    return { family: fam as "S" | "A" | "O", clinical_id: cid, weight: num(r["weight"]) };
  });

  const knownModeIds = new Set(Object.keys(wBase)); // minimal mode set

  const config: ModeScorerConfig = {
    wBase, wCoping, wContext,
    tau: 1.5,
    copingTau: 1.25,
    clipNegSchemasForCoping: true,
    knownClinicalIds,
    knownModeIds,
  };

  return { config, copingMap };
}

/** -------- Tiny CSV parser (quoted fields, single-line rows) -------- */

function parseCsv(src: string): Array<Record<string, string>> {
  const lines = src.replace(/\r/g, "").split("\n").filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  // trim surrounding spaces & quotes
  return out.map(s => {
    let t = s.trim();
    if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
    return t;
  });
}

function normId(s: string | undefined): string {
  if (!s) return "";
  return s.trim().toLowerCase();
}

function num(s: string | number | undefined): number {
  if (typeof s === "number") return s;
  const v = parseFloat((s ?? "").trim());
  if (Number.isNaN(v)) return 0;
  return v;
}

/** -------- Convenience: one-shot score from directory -------- */

export function scoreFromDir(dir: string, inputs: ScoreInputs): ModeScore {
  const { config, copingMap } = loadConfigFromDir(dir);
  return scoreFromConfig(inputs, config, copingMap);
}
