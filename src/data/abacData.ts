import {
  AbacUser,
  AbacRole,
  AbacPolicy,
  AbacCondition,
  AbacResource,
  AbacEnv,
  AbacDecision,
  AbacAction,
} from "@/types/abac";

// =========================================================================
// Seed Data
// =========================================================================

export let abacUsers: AbacUser[] = [
  {
    _id: "u_root",
    name: "Site Super Admin",
    email: "root@multimart.io",
    type: "site_admin",
    roleIds: ["role_super_admin"],
    attributes: { region: "GLOBAL", verified: true, twoFactor: true },
    active: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    _id: "u_ops",
    name: "Priya (Catalog Ops)",
    email: "priya@multimart.io",
    type: "site_admin",
    roleIds: ["role_catalog_ops"],
    attributes: { department: "catalog", region: "IN", verified: true },
    active: true,
    createdAt: new Date("2024-02-10"),
  },
  {
    _id: "u_vendor1_admin",
    name: "TechGear Owner",
    email: "owner@techgear.com",
    type: "vendor_admin",
    roleIds: ["role_vendor_admin"],
    attributes: { vendorId: "v1", verified: true, twoFactor: true },
    active: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    _id: "u_vendor1_staff",
    name: "TechGear Staff",
    email: "staff@techgear.com",
    type: "vendor_staff",
    roleIds: ["role_vendor_staff"],
    attributes: { vendorId: "v1", department: "catalog", verified: true },
    active: true,
    createdAt: new Date("2024-03-01"),
  },
  {
    _id: "u_vendor2_admin",
    name: "Fashion Forward Owner",
    email: "owner@fashionforward.com",
    type: "vendor_admin",
    roleIds: ["role_vendor_admin"],
    attributes: { vendorId: "v2", verified: false },
    active: true,
    createdAt: new Date("2024-04-05"),
  },
];

export let abacPolicies: AbacPolicy[] = [
  {
    _id: "pol_super",
    name: "Super Admin Full Access",
    description: "Site super admins can do anything.",
    effect: "allow",
    resource: "*",
    actions: ["manage"],
    conditions: [{ attribute: "user.type", operator: "eq", value: "site_admin" }],
    priority: 100,
    enabled: true,
    builtIn: true,
  },
  {
    _id: "pol_catalog_ops",
    name: "Catalog Ops — manage products & categories",
    description: "Catalog department can manage product catalog but not payouts.",
    effect: "allow",
    resource: "product",
    actions: ["read", "update", "approve", "publish"],
    conditions: [
      { attribute: "user.attributes.department", operator: "eq", value: "catalog" },
    ],
    priority: 60,
    enabled: true,
  },
  {
    _id: "pol_vendor_own_products",
    name: "Vendors manage own products",
    description: "Vendor admins/staff can manage products belonging to their vendor.",
    effect: "allow",
    resource: "product",
    actions: ["create", "read", "update", "delete"],
    conditions: [
      { attribute: "user.type", operator: "in", value: ["vendor_admin", "vendor_staff"] },
      { attribute: "resource.vendorId", operator: "eq", value: "{{user.attributes.vendorId}}" },
    ],
    priority: 50,
    enabled: true,
    builtIn: true,
  },
  {
    _id: "pol_vendor_admin_flash",
    name: "Vendor admin manages flash sales (own)",
    description: "Only vendor admins (not staff) can configure flash sales on own products.",
    effect: "allow",
    resource: "flash_sale",
    actions: ["create", "update", "delete", "read"],
    conditions: [
      { attribute: "user.type", operator: "eq", value: "vendor_admin" },
      { attribute: "resource.vendorId", operator: "eq", value: "{{user.attributes.vendorId}}" },
    ],
    priority: 55,
    enabled: true,
  },
  {
    _id: "pol_deny_unverified_publish",
    name: "Deny publish for unverified vendors",
    description: "Unverified vendors cannot publish products live.",
    effect: "deny",
    resource: "product",
    actions: ["publish"],
    conditions: [
      { attribute: "user.attributes.verified", operator: "eq", value: false },
    ],
    priority: 90,
    enabled: true,
    builtIn: true,
  },
  {
    _id: "pol_payout_2fa",
    name: "Payouts require 2FA",
    description: "Only users with 2FA enabled can approve payouts.",
    effect: "deny",
    resource: "payout",
    actions: ["approve"],
    conditions: [
      { attribute: "user.attributes.twoFactor", operator: "neq", value: true },
    ],
    priority: 95,
    enabled: true,
    builtIn: true,
  },
];

export let abacRoles: AbacRole[] = [
  {
    _id: "role_super_admin",
    name: "Site Super Admin",
    description: "Unrestricted platform access.",
    policyIds: ["pol_super"],
    builtIn: true,
  },
  {
    _id: "role_catalog_ops",
    name: "Catalog Operations",
    description: "Manage catalog, approve & publish vendor products.",
    policyIds: ["pol_catalog_ops", "pol_deny_unverified_publish"],
  },
  {
    _id: "role_vendor_admin",
    name: "Vendor Admin",
    description: "Full control over own vendor's products, flash sales, payouts.",
    policyIds: [
      "pol_vendor_own_products",
      "pol_vendor_admin_flash",
      "pol_payout_2fa",
      "pol_deny_unverified_publish",
    ],
    builtIn: true,
  },
  {
    _id: "role_vendor_staff",
    name: "Vendor Staff",
    description: "Limited operational access to own vendor's products.",
    policyIds: ["pol_vendor_own_products"],
    builtIn: true,
  },
];

// =========================================================================
// CRUD helpers
// =========================================================================

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

export const getAbacUsers = () => [...abacUsers];
export const getAbacRoles = () => [...abacRoles];
export const getAbacPolicies = () => [...abacPolicies];

export function upsertUser(u: AbacUser) {
  const i = abacUsers.findIndex((x) => x._id === u._id);
  if (i >= 0) abacUsers[i] = u;
  else abacUsers = [...abacUsers, { ...u, _id: u._id || uid("u") }];
}
export function deleteUser(id: string) {
  abacUsers = abacUsers.filter((u) => u._id !== id);
}

export function upsertRole(r: AbacRole) {
  const i = abacRoles.findIndex((x) => x._id === r._id);
  if (i >= 0) abacRoles[i] = r;
  else abacRoles = [...abacRoles, { ...r, _id: r._id || uid("role") }];
}
export function deleteRole(id: string) {
  abacRoles = abacRoles.filter((r) => r._id !== id);
}

export function upsertPolicy(p: AbacPolicy) {
  const i = abacPolicies.findIndex((x) => x._id === p._id);
  if (i >= 0) abacPolicies[i] = p;
  else abacPolicies = [...abacPolicies, { ...p, _id: p._id || uid("pol") }];
}
export function deletePolicy(id: string) {
  abacPolicies = abacPolicies.filter((p) => p._id !== id);
}

// =========================================================================
// ABAC Engine
// =========================================================================

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

/** Resolves "{{user.attributes.vendorId}}" placeholders against context. */
function resolveValue(value: unknown, ctx: Record<string, unknown>): unknown {
  if (typeof value !== "string") return value;
  const m = value.match(/^\{\{\s*(.+?)\s*\}\}$/);
  if (!m) return value;
  return resolvePath(ctx, m[1]);
}

function evalCondition(c: AbacCondition, ctx: Record<string, unknown>): boolean {
  const actual = resolvePath(ctx, c.attribute);
  const expected = resolveValue(c.value, ctx);
  switch (c.operator) {
    case "eq": return actual === expected;
    case "neq": return actual !== expected;
    case "in": return Array.isArray(expected) && (expected as unknown[]).includes(actual as never);
    case "nin": return Array.isArray(expected) && !(expected as unknown[]).includes(actual as never);
    case "gt": return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "lt": return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "contains":
      if (Array.isArray(actual)) return (actual as unknown[]).includes(expected as never);
      if (typeof actual === "string") return actual.includes(String(expected));
      return false;
    case "exists": return actual !== undefined && actual !== null;
    default: return false;
  }
}

/** Collect all enabled policies a user inherits via their roles. */
function policiesForUser(user: AbacUser): AbacPolicy[] {
  const ids = new Set<string>();
  user.roleIds.forEach((rid) => {
    const r = abacRoles.find((x) => x._id === rid);
    r?.policyIds.forEach((p) => ids.add(p));
  });
  return abacPolicies.filter((p) => p.enabled && ids.has(p._id));
}

function actionMatches(policy: AbacPolicy, action: AbacAction): boolean {
  if (policy.actions.includes("manage")) return true;
  return policy.actions.includes(action);
}

export function evaluateAbac(input: {
  user: AbacUser;
  action: AbacAction;
  resource: AbacResource;
  env?: AbacEnv;
}): AbacDecision {
  if (!input.user.active) {
    return { allowed: false, matchedPolicies: [], reason: "User is inactive" };
  }
  const env: AbacEnv = input.env ?? {
    time: { hour: new Date().getHours(), weekday: new Date().getDay() },
  };
  const ctx = { user: input.user, resource: input.resource, env };
  const candidates = policiesForUser(input.user).filter(
    (p) => (p.resource === "*" || p.resource === input.resource.type) && actionMatches(p, input.action),
  );

  const matched: { policy: AbacPolicy; effect: "allow" | "deny" }[] = [];
  for (const p of candidates) {
    if (p.conditions.every((c) => evalCondition(c, ctx))) {
      matched.push({ policy: p, effect: p.effect });
    }
  }

  if (matched.length === 0) {
    return {
      allowed: false,
      matchedPolicies: [],
      reason: "No matching policy (default deny)",
    };
  }

  // Highest priority wins; deny beats allow at the same priority.
  matched.sort((a, b) => {
    if (b.policy.priority !== a.policy.priority) return b.policy.priority - a.policy.priority;
    if (a.effect === b.effect) return 0;
    return a.effect === "deny" ? -1 : 1;
  });
  const winner = matched[0];
  return {
    allowed: winner.effect === "allow",
    matchedPolicies: matched.map((m) => ({ policyId: m.policy._id, effect: m.effect })),
    reason: `${winner.effect.toUpperCase()} by "${winner.policy.name}" (priority ${winner.policy.priority})`,
  };
}