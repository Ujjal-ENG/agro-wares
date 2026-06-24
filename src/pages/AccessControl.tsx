import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Plus, Edit, Trash2, X, Save, Play, Users as UsersIcon,
  KeyRound, FileLock2, Store, CheckCircle2, XCircle, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAbacUsers, getAbacRoles, getAbacPolicies,
  upsertUser, deleteUser, upsertRole, deleteRole,
  upsertPolicy, deletePolicy, evaluateAbac,
} from "@/data/abacData";
import { getAllVendors } from "@/data/mockDatabase";
import type {
  AbacUser, AbacRole, AbacPolicy, AbacCondition, AbacAction,
  ResourceType, AbacOperator, PrincipalType,
} from "@/types/abac";

const RESOURCES: (ResourceType | "*")[] = [
  "*", "product", "order", "vendor", "category", "user", "policy", "flash_sale", "payout",
];
const ACTIONS: AbacAction[] = ["create", "read", "update", "delete", "approve", "publish", "manage"];
const OPERATORS: AbacOperator[] = ["eq", "neq", "in", "nin", "gt", "lt", "contains", "exists"];
const PRINCIPALS: PrincipalType[] = ["site_admin", "vendor_admin", "vendor_staff", "customer"];

const blankUser = (): AbacUser => ({
  _id: "", name: "", email: "", type: "vendor_staff",
  roleIds: [], attributes: {}, active: true, createdAt: new Date(),
});
const blankRole = (): AbacRole => ({
  _id: "", name: "", description: "", policyIds: [],
});
const blankPolicy = (): AbacPolicy => ({
  _id: "", name: "", description: "", effect: "allow",
  resource: "product", actions: ["read"], conditions: [], priority: 50, enabled: true,
});

export default function AccessControl() {
  const { toast } = useToast();
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const users = getAbacUsers();
  const roles = getAbacRoles();
  const policies = getAbacPolicies();
  const vendors = getAllVendors();

  // ---------- USER MODAL ----------
  const [userOpen, setUserOpen] = useState(false);
  const [user, setUser] = useState<AbacUser>(blankUser());
  const openUser = (u?: AbacUser) => {
    setUser(u ? JSON.parse(JSON.stringify(u)) : blankUser()); setUserOpen(true);
  };
  const saveUser = () => {
    if (!user.name || !user.email) return toast({ title: "Name & email required", variant: "destructive" });
    upsertUser({ ...user, _id: user._id || `u_${Date.now()}` });
    toast({ title: "User saved" }); setUserOpen(false); refresh();
  };

  // ---------- ROLE MODAL ----------
  const [roleOpen, setRoleOpen] = useState(false);
  const [role, setRole] = useState<AbacRole>(blankRole());
  const openRole = (r?: AbacRole) => {
    setRole(r ? JSON.parse(JSON.stringify(r)) : blankRole()); setRoleOpen(true);
  };
  const saveRole = () => {
    if (!role.name) return toast({ title: "Role name required", variant: "destructive" });
    upsertRole({ ...role, _id: role._id || `role_${Date.now()}` });
    toast({ title: "Role saved" }); setRoleOpen(false); refresh();
  };

  // ---------- POLICY MODAL ----------
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policy, setPolicy] = useState<AbacPolicy>(blankPolicy());
  const openPolicy = (p?: AbacPolicy) => {
    setPolicy(p ? JSON.parse(JSON.stringify(p)) : blankPolicy()); setPolicyOpen(true);
  };
  const savePolicy = () => {
    if (!policy.name) return toast({ title: "Policy name required", variant: "destructive" });
    upsertPolicy({ ...policy, _id: policy._id || `pol_${Date.now()}` });
    toast({ title: "Policy saved" }); setPolicyOpen(false); refresh();
  };
  const addCondition = () =>
    setPolicy({ ...policy, conditions: [...policy.conditions, { attribute: "user.attributes.region", operator: "eq", value: "" }] });
  const updateCondition = (i: number, patch: Partial<AbacCondition>) => {
    const next = [...policy.conditions]; next[i] = { ...next[i], ...patch };
    setPolicy({ ...policy, conditions: next });
  };
  const removeCondition = (i: number) =>
    setPolicy({ ...policy, conditions: policy.conditions.filter((_, idx) => idx !== i) });

  // ---------- SIMULATOR ----------
  const [simUserId, setSimUserId] = useState(users[0]?._id ?? "");
  const [simAction, setSimAction] = useState<AbacAction>("update");
  const [simResource, setSimResource] = useState<ResourceType>("product");
  const [simVendorId, setSimVendorId] = useState(vendors[0]?._id ?? "");
  const simulation = useMemo(() => {
    const u = users.find((x) => x._id === simUserId);
    if (!u) return null;
    return evaluateAbac({
      user: u,
      action: simAction,
      resource: { type: simResource, vendorId: simVendorId, id: "res_demo" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simUserId, simAction, simResource, simVendorId, users, policies, roles]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <Link to="/" className="text-2xl font-bold text-primary">Access Control</Link>
            <Badge variant="secondary" className="ml-2">ABAC</Badge>
          </div>
          <div className="flex gap-2">
            <Link to="/admin"><Button variant="outline" size="sm">Admin Panel</Button></Link>
            <Link to="/"><Button variant="outline" size="sm">Storefront</Button></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users"><UsersIcon className="mr-2 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="roles"><KeyRound className="mr-2 h-4 w-4" />Roles</TabsTrigger>
            <TabsTrigger value="policies"><FileLock2 className="mr-2 h-4 w-4" />Policies</TabsTrigger>
            <TabsTrigger value="vendors"><Store className="mr-2 h-4 w-4" />Vendors</TabsTrigger>
            <TabsTrigger value="simulator"><Play className="mr-2 h-4 w-4" />Simulator</TabsTrigger>
          </TabsList>

          {/* USERS */}
          <TabsContent value="users">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Users & Principals</h2>
                <p className="text-sm text-muted-foreground">Site admins, vendor admins and staff with their attributes.</p>
              </div>
              <Button onClick={() => openUser()}><Plus className="mr-2 h-4 w-4" />Add User</Button>
            </div>
            <div className="grid gap-3">
              {users.map((u) => (
                <Card key={u._id}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{u.name}</h3>
                        <Badge variant="outline">{u.type}</Badge>
                        {u.active ? <Badge className="bg-green-600 hover:bg-green-600">active</Badge>
                          : <Badge variant="destructive">disabled</Badge>}
                        {u.attributes.verified && <Badge variant="secondary">verified</Badge>}
                        {u.attributes.twoFactor && <Badge variant="secondary"><Lock className="mr-1 h-3 w-3" />2FA</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="mt-2 flex flex-wrap gap-1 text-xs">
                        {u.roleIds.map((rid) => {
                          const r = roles.find((x) => x._id === rid);
                          return r && <Badge key={rid} variant="outline">{r.name}</Badge>;
                        })}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {Object.entries(u.attributes).map(([k, v]) =>
                          v !== undefined ? <span key={k} className="mr-3">{k}: <span className="font-mono">{String(v)}</span></span> : null,
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openUser(u)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete user?")) { deleteUser(u._id); refresh(); } }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ROLES */}
          <TabsContent value="roles">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Roles</h2>
                <p className="text-sm text-muted-foreground">Bundles of policies that can be assigned to users.</p>
              </div>
              <Button onClick={() => openRole()}><Plus className="mr-2 h-4 w-4" />Add Role</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {roles.map((r) => (
                <Card key={r._id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {r.name}
                        {r.builtIn && <Badge variant="secondary">built-in</Badge>}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openRole(r)}><Edit className="h-4 w-4" /></Button>
                        {!r.builtIn && (
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete role?")) { deleteRole(r._id); refresh(); } }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {r.policyIds.map((pid) => {
                        const p = policies.find((x) => x._id === pid);
                        return p && <Badge key={pid} variant="outline">{p.name}</Badge>;
                      })}
                      {r.policyIds.length === 0 && <span className="text-xs text-muted-foreground">No policies</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* POLICIES */}
          <TabsContent value="policies">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Policies</h2>
                <p className="text-sm text-muted-foreground">Attribute-based rules. Higher priority wins; deny beats allow at same priority.</p>
              </div>
              <Button onClick={() => openPolicy()}><Plus className="mr-2 h-4 w-4" />Add Policy</Button>
            </div>
            <div className="space-y-3">
              {[...policies].sort((a, b) => b.priority - a.priority).map((p) => (
                <Card key={p._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{p.name}</h3>
                          <Badge variant={p.effect === "allow" ? "default" : "destructive"}>{p.effect}</Badge>
                          <Badge variant="outline">resource: {p.resource}</Badge>
                          <Badge variant="outline">priority {p.priority}</Badge>
                          {!p.enabled && <Badge variant="secondary">disabled</Badge>}
                          {p.builtIn && <Badge variant="secondary">built-in</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1 text-xs">
                          {p.actions.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
                        </div>
                        {p.conditions.length > 0 && (
                          <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-x-auto">
{p.conditions.map((c) =>
  `${c.attribute} ${c.operator}${c.operator === "exists" ? "" : " " + JSON.stringify(c.value)}`,
).join("\n")}
                          </pre>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch checked={p.enabled} onCheckedChange={(v) => { upsertPolicy({ ...p, enabled: v }); refresh(); }} />
                        <Button variant="ghost" size="icon" onClick={() => openPolicy(p)}><Edit className="h-4 w-4" /></Button>
                        {!p.builtIn && (
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete policy?")) { deletePolicy(p._id); refresh(); } }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* VENDORS */}
          <TabsContent value="vendors">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Vendor Directory</h2>
              <p className="text-sm text-muted-foreground">Vendors and their associated principals.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {vendors.map((v) => {
                const principals = users.filter((u) => u.attributes.vendorId === v._id);
                return (
                  <Card key={v._id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>{v.name}</span>
                        {v.verified ? <Badge className="bg-green-600 hover:bg-green-600">verified</Badge>
                          : <Badge variant="destructive">unverified</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{v.email}</p>
                      <div className="text-xs">Vendor ID: <span className="font-mono">{v._id}</span></div>
                      <div className="pt-2">
                        <div className="text-xs font-semibold mb-1">Principals ({principals.length})</div>
                        {principals.length === 0 && <p className="text-xs text-muted-foreground">No users assigned.</p>}
                        {principals.map((p) => (
                          <div key={p._id} className="flex items-center justify-between border rounded px-2 py-1 mb-1">
                            <span>{p.name} <Badge variant="outline" className="ml-1">{p.type}</Badge></span>
                            <Button variant="ghost" size="sm" onClick={() => openUser(p)}>Edit</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* SIMULATOR */}
          <TabsContent value="simulator">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Permission Simulator</h2>
              <p className="text-sm text-muted-foreground">Test "Can user X do action Y on resource Z?" against the live policy set.</p>
            </div>
            <Card>
              <CardContent className="p-6 grid gap-4 md:grid-cols-4">
                <div>
                  <Label>User</Label>
                  <Select value={simUserId} onValueChange={setSimUserId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={simAction} onValueChange={(v) => setSimAction(v as AbacAction)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Resource</Label>
                  <Select value={simResource} onValueChange={(v) => setSimResource(v as ResourceType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RESOURCES.filter((r) => r !== "*").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Resource Vendor</Label>
                  <Select value={simVendorId} onValueChange={setSimVendorId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            {simulation && (
              <Card className="mt-4">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    {simulation.allowed
                      ? <CheckCircle2 className="h-8 w-8 text-green-600" />
                      : <XCircle className="h-8 w-8 text-destructive" />}
                    <div>
                      <div className="text-xl font-bold">{simulation.allowed ? "ALLOWED" : "DENIED"}</div>
                      <div className="text-sm text-muted-foreground">{simulation.reason}</div>
                    </div>
                  </div>
                  {simulation.matchedPolicies.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-1">Matched policies</div>
                      <div className="flex flex-wrap gap-2">
                        {simulation.matchedPolicies.map((m) => {
                          const p = policies.find((x) => x._id === m.policyId);
                          return (
                            <Badge key={m.policyId} variant={m.effect === "allow" ? "default" : "destructive"}>
                              {p?.name ?? m.policyId} · {m.effect}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* USER DIALOG */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{user._id ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} /></div>
            <div>
              <Label>Principal Type</Label>
              <Select value={user.type} onValueChange={(v) => setUser({ ...user, type: v as PrincipalType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRINCIPALS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor (if applicable)</Label>
              <Select
                value={user.attributes.vendorId ?? "none"}
                onValueChange={(v) =>
                  setUser({ ...user, attributes: { ...user.attributes, vendorId: v === "none" ? undefined : v } })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none —</SelectItem>
                  {vendors.map((v) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Department</Label>
              <Input value={user.attributes.department ?? ""} placeholder="catalog / orders / finance"
                onChange={(e) => setUser({ ...user, attributes: { ...user.attributes, department: e.target.value || undefined } })} />
            </div>
            <div><Label>Region</Label>
              <Input value={user.attributes.region ?? ""} placeholder="IN / US / EU"
                onChange={(e) => setUser({ ...user, attributes: { ...user.attributes, region: e.target.value || undefined } })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox checked={!!user.attributes.verified}
                onCheckedChange={(v) => setUser({ ...user, attributes: { ...user.attributes, verified: !!v } })} />
              <Label>Verified</Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox checked={!!user.attributes.twoFactor}
                onCheckedChange={(v) => setUser({ ...user, attributes: { ...user.attributes, twoFactor: !!v } })} />
              <Label>2FA enabled</Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={user.active} onCheckedChange={(v) => setUser({ ...user, active: v })} />
              <Label>Active</Label>
            </div>
            <div className="md:col-span-2">
              <Label>Roles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {roles.map((r) => (
                  <label key={r._id} className="flex items-center gap-2 text-sm border rounded p-2">
                    <Checkbox
                      checked={user.roleIds.includes(r._id)}
                      onCheckedChange={(v) =>
                        setUser({
                          ...user,
                          roleIds: v ? [...user.roleIds, r._id] : user.roleIds.filter((x) => x !== r._id),
                        })
                      }
                    />
                    {r.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserOpen(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
            <Button onClick={saveUser}><Save className="mr-2 h-4 w-4" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROLE DIALOG */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{role._id ? "Edit Role" : "Add Role"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={role.name} onChange={(e) => setRole({ ...role, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={role.description} onChange={(e) => setRole({ ...role, description: e.target.value })} /></div>
            <div>
              <Label>Policies</Label>
              <div className="grid gap-2 mt-2 max-h-64 overflow-y-auto">
                {policies.map((p) => (
                  <label key={p._id} className="flex items-start gap-2 text-sm border rounded p-2">
                    <Checkbox
                      checked={role.policyIds.includes(p._id)}
                      onCheckedChange={(v) =>
                        setRole({
                          ...role,
                          policyIds: v ? [...role.policyIds, p._id] : role.policyIds.filter((x) => x !== p._id),
                        })
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <Badge variant={p.effect === "allow" ? "default" : "destructive"}>{p.effect}</Badge>
                        <Badge variant="outline">{p.resource}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
            <Button onClick={saveRole}><Save className="mr-2 h-4 w-4" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POLICY DIALOG */}
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{policy._id ? "Edit Policy" : "Add Policy"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Name</Label><Input value={policy.name} onChange={(e) => setPolicy({ ...policy, name: e.target.value })} /></div>
              <div>
                <Label>Effect</Label>
                <Select value={policy.effect} onValueChange={(v) => setPolicy({ ...policy, effect: v as "allow" | "deny" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">allow</SelectItem>
                    <SelectItem value="deny">deny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Resource</Label>
                <Select value={policy.resource} onValueChange={(v) => setPolicy({ ...policy, resource: v as ResourceType | "*" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Input type="number" value={policy.priority}
                  onChange={(e) => setPolicy({ ...policy, priority: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={policy.description}
              onChange={(e) => setPolicy({ ...policy, description: e.target.value })} /></div>

            <div>
              <Label>Actions</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {ACTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm border rounded p-2">
                    <Checkbox
                      checked={policy.actions.includes(a)}
                      onCheckedChange={(v) =>
                        setPolicy({
                          ...policy,
                          actions: v ? [...policy.actions, a] : policy.actions.filter((x) => x !== a),
                        })
                      }
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conditions (ALL must match)</Label>
                <Button size="sm" variant="outline" onClick={addCondition}><Plus className="mr-1 h-3 w-3" />Add</Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Attribute paths: <code>user.type</code>, <code>user.attributes.vendorId</code>,
                <code> resource.vendorId</code>, <code>env.time.hour</code>. Use <code>{`{{user.attributes.vendorId}}`}</code> in value
                to compare against the user's own attribute.
              </p>
              <div className="space-y-2">
                {policy.conditions.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-5" placeholder="attribute path"
                      value={c.attribute} onChange={(e) => updateCondition(i, { attribute: e.target.value })} />
                    <Select value={c.operator} onValueChange={(v) => updateCondition(i, { operator: v as AbacOperator })}>
                      <SelectTrigger className="col-span-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input className="col-span-4" placeholder='value (JSON: "x", 1, true, ["a","b"])'
                      value={typeof c.value === "string" ? c.value : JSON.stringify(c.value ?? "")}
                      onChange={(e) => {
                        const raw = e.target.value;
                        let parsed: AbacCondition["value"] = raw;
                        try { parsed = JSON.parse(raw); } catch { /* keep string */ }
                        updateCondition(i, { value: parsed });
                      }} />
                    <Button variant="ghost" size="icon" className="col-span-1" onClick={() => removeCondition(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {policy.conditions.length === 0 && (
                  <p className="text-xs text-muted-foreground">No conditions — policy will match every request for this resource/action.</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={policy.enabled} onCheckedChange={(v) => setPolicy({ ...policy, enabled: v })} />
              <Label>Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyOpen(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
            <Button onClick={savePolicy}><Save className="mr-2 h-4 w-4" />Save Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}