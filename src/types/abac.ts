// ABAC (Attribute-Based Access Control) Types
// Designed for a multi-vendor e-commerce platform.

export type PrincipalType = "site_admin" | "vendor_admin" | "vendor_staff" | "customer";

/** A subject (user) in the system, with attributes used by ABAC policies. */
export interface AbacUser {
  _id: string;
  name: string;
  email: string;
  type: PrincipalType;
  roleIds: string[];
  attributes: {
    vendorId?: string;        // for vendor_admin / vendor_staff
    department?: string;      // e.g. "catalog", "orders", "finance"
    region?: string;          // e.g. "IN", "US", "EU"
    verified?: boolean;
    twoFactor?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
  active: boolean;
  createdAt: Date;
}

/** A reusable bundle of policy IDs. */
export interface AbacRole {
  _id: string;
  name: string;          // "Site Super Admin", "Vendor Manager", ...
  description: string;
  policyIds: string[];
  builtIn?: boolean;
}

/** Supported resource types this app guards. */
export type ResourceType =
  | "product"
  | "order"
  | "vendor"
  | "category"
  | "user"
  | "policy"
  | "flash_sale"
  | "payout";

export type AbacAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "publish"
  | "manage";

export type AbacOperator =
  | "eq"
  | "neq"
  | "in"
  | "nin"
  | "gt"
  | "lt"
  | "contains"
  | "exists";

/**
 * A single ABAC condition.
 * `attribute` is a dotted path resolved against the evaluation context:
 *   - user.*          → subject attributes (e.g. user.attributes.region)
 *   - resource.*      → resource attributes (e.g. resource.vendorId)
 *   - env.*           → environment (e.g. env.time.hour, env.ip)
 */
export interface AbacCondition {
  attribute: string;
  operator: AbacOperator;
  value?: string | number | boolean | Array<string | number>;
}

export interface AbacPolicy {
  _id: string;
  name: string;
  description: string;
  effect: "allow" | "deny";
  resource: ResourceType | "*";
  actions: AbacAction[];        // ["read","update"] or ["*"] via "manage"
  conditions: AbacCondition[];  // ALL must pass (AND). Empty = always true.
  priority: number;             // higher wins on conflicts; deny beats allow at same priority
  enabled: boolean;
  builtIn?: boolean;
}

export interface AbacResource {
  type: ResourceType;
  id?: string;
  vendorId?: string;
  ownerId?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AbacEnv {
  time: { hour: number; weekday: number };
  ip?: string;
  region?: string;
}

export interface AbacDecision {
  allowed: boolean;
  matchedPolicies: { policyId: string; effect: "allow" | "deny" }[];
  reason: string;
}