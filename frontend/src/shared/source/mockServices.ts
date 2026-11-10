import type { Health, Service } from '../domain/service';

/*
 * 22 mock services (NI-01 Decisions #9).
 * Latin square of 16: kind (by district) × health, with (docs, ui) = combo[(kind + health) % 4],
 * so every (kind, health) and every (health, docs, ui) pair appears once.
 * Plus 6 healthy services with docs and ui. Per district 6/6/5/5; health 10/4/4/4; docs 14, ui 14.
 */

interface Seed {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly health: Health;
  readonly docs: boolean;
  readonly ui: boolean;
  readonly rps: number;
  readonly p99Ms: number;
  readonly version: string;
  readonly owner: string;
  readonly description: string;
  readonly capabilities: readonly string[];
  readonly dependsOn?: readonly string[];
}

const CORE = 'Core Platform';
const COMMERCE = 'Commerce';
const MESSAGING = 'Messaging';
const DATA = 'Data & Storage';

const HEALTHY: Health = { state: 'healthy' };
const degraded = (reason: string): Health => ({ state: 'degraded', reason });
const deploying = (percent: number): Health => ({ state: 'deploying', percent });
const down = (reason: string): Health => ({ state: 'down', reason });

function readyInstances(h: Health, desired: number): number {
  if (h.state === 'down') return 0;
  if (h.state === 'deploying') return Math.round((desired * h.percent) / 100);
  return desired;
}

function uptimeOf(h: Health): number {
  return { healthy: 0.9998, degraded: 0.9971, deploying: 0.999, down: 0.9812 }[h.state];
}

function toService(s: Seed): Service {
  const desired = 4 + (s.rps % 9);
  return {
    reg: {
      id: s.id, name: s.name, domain: s.domain, owner: s.owner, version: s.version,
      endpoint: `https://api.acme.io/${s.id}/${s.version.split('.')[0]}`,
      region: 'ap-east-1', description: s.description, capabilities: s.capabilities,
      dependsOn: s.dependsOn ?? [],
      docs: s.docs ? { kind: 'openapi', specUrl: `/mock/openapi/${s.id}.json` } : { kind: 'none' },
      ui: s.ui ? { kind: 'iframe', url: `/mock/ui/placeholder.html?id=${s.id}` } : { kind: 'none' },
    },
    status: {
      health: s.health, instances: { ready: readyInstances(s.health, desired), desired },
      rps: s.rps, p99Ms: s.p99Ms, uptime30d: uptimeOf(s.health),
    },
  };
}

const seeds: readonly Seed[] = [
  // Core Platform — tower
  { id: 'identity', name: 'Identity', domain: CORE, health: HEALTHY, docs: true, ui: true, rps: 2400, p99Ms: 38, version: 'v3.8.2', owner: 'Platform team',
    description: 'Central authentication and authorization. Issues OAuth 2.0 and OIDC tokens and manages users, roles and MFA for every service in the city.',
    capabilities: ['OAuth 2.0 and OpenID Connect', 'Role-based access control', 'TOTP and WebAuthn MFA', 'Service-to-service tokens'] },
  { id: 'config', name: 'Config', domain: CORE, health: degraded('Config reload is slow: 2 of 9 pods are still reading the previous revision.'), docs: true, ui: false, rps: 1500, p99Ms: 210, version: 'v2.4.1', owner: 'Platform team',
    description: 'Versioned runtime configuration for every service, with staged rollout and instant revert.',
    capabilities: ['Versioned key-value config', 'Staged rollout', 'Instant revert'] },
  { id: 'flags', name: 'Feature Flags', domain: CORE, health: deploying(40), docs: false, ui: true, rps: 1100, p99Ms: 22, version: 'v1.6.0', owner: 'Platform team',
    description: 'Feature flags and percentage rollouts evaluated at the edge.',
    capabilities: ['Boolean and multivariate flags', 'Percentage rollouts', 'Audience targeting'] },
  { id: 'audit', name: 'Audit Log', domain: CORE, health: down('All pods in CrashLoopBackOff since 08:15 UTC after a storage credential rotation.'), docs: false, ui: false, rps: 300, p99Ms: 0, version: 'v1.2.3', owner: 'Security team',
    description: 'Append-only record of every privileged action across the platform.',
    capabilities: ['Tamper-evident log', 'Retention policies', 'Export to SIEM'] },
  { id: 'secrets', name: 'Secrets', domain: CORE, health: HEALTHY, docs: true, ui: true, rps: 700, p99Ms: 15, version: 'v2.0.5', owner: 'Security team',
    description: 'Encrypted secret storage with short-lived leases for workloads.',
    capabilities: ['Envelope encryption', 'Leased credentials', 'Automatic rotation'] },
  { id: 'scheduler', name: 'Scheduler', domain: CORE, health: HEALTHY, docs: true, ui: true, rps: 400, p99Ms: 48, version: 'v1.9.0', owner: 'Platform team',
    description: 'Cron and one-off jobs with retries, backoff and run history.',
    capabilities: ['Cron schedules', 'Retries with backoff', 'Run history'] },
  // Commerce — block
  { id: 'catalog', name: 'Catalog', domain: COMMERCE, health: HEALTHY, docs: true, ui: false, rps: 2100, p99Ms: 41, version: 'v4.1.0', owner: 'Commerce team',
    description: 'Products, variants and categories with localized content.',
    capabilities: ['Product and variant model', 'Category tree', 'Localized content'] },
  { id: 'payments', name: 'Payments', domain: COMMERCE, health: degraded('Elevated latency on acquirer EU-2 since 09:42 UTC. Charges succeed but p99 is above 400 ms.'), docs: false, ui: true, rps: 1200, p99Ms: 412, version: 'v2.11.4', owner: 'Payments team',
    description: 'Card and wallet payment processing with fraud screening. Wraps three acquirers behind a single charge API.',
    capabilities: ['Charges, refunds and captures', '3-D Secure 2', 'Fraud scoring', 'Multi-acquirer routing'], dependsOn: ['identity'] },
  { id: 'pricing', name: 'Pricing', domain: COMMERCE, health: deploying(75), docs: false, ui: false, rps: 900, p99Ms: 30, version: 'v3.0.0', owner: 'Commerce team',
    description: 'Price lists, promotions and tax calculation.',
    capabilities: ['Price lists', 'Promotions', 'Tax calculation'] },
  { id: 'cart', name: 'Cart', domain: COMMERCE, health: down('Redis primary unreachable; failover did not complete.'), docs: true, ui: true, rps: 500, p99Ms: 0, version: 'v2.2.7', owner: 'Commerce team',
    description: 'Shopping carts with reservation of stock for 15 minutes.',
    capabilities: ['Persistent carts', 'Stock reservation', 'Guest checkout'], dependsOn: ['catalog'] },
  { id: 'orders', name: 'Orders', domain: COMMERCE, health: HEALTHY, docs: true, ui: true, rps: 1800, p99Ms: 64, version: 'v5.2.0', owner: 'Commerce team',
    description: 'Order lifecycle from checkout to delivery. Tracks state transitions and emits events consumed by payments, inventory and notifications.',
    capabilities: ['Order state machine', 'Idempotent checkout API', 'Event stream: order.*', 'Bulk export to CSV'], dependsOn: ['identity', 'payments', 'notify'] },
  { id: 'inventory', name: 'Inventory', domain: COMMERCE, health: HEALTHY, docs: true, ui: true, rps: 1300, p99Ms: 52, version: 'v3.4.2', owner: 'Commerce team',
    description: 'Stock levels per warehouse with reservations and adjustments.',
    capabilities: ['Multi-warehouse stock', 'Reservations', 'Adjustment history'] },
  // Messaging — cylinder
  { id: 'webhooks', name: 'Webhooks', domain: MESSAGING, health: HEALTHY, docs: false, ui: true, rps: 800, p99Ms: 95, version: 'v1.7.3', owner: 'Messaging team',
    description: 'Signed outbound webhooks with retries and a replay console.',
    capabilities: ['HMAC-signed payloads', 'Retries with backoff', 'Replay'] },
  { id: 'eventbus', name: 'Event Bus', domain: MESSAGING, health: degraded('Consumer lag on topic order.* is 4 minutes.'), docs: false, ui: false, rps: 2200, p99Ms: 180, version: 'v6.0.2', owner: 'Messaging team',
    description: 'Durable publish-subscribe topics shared by every service.',
    capabilities: ['Durable topics', 'Consumer groups', 'Dead-letter queues'] },
  { id: 'email', name: 'Email Relay', domain: MESSAGING, health: deploying(30), docs: true, ui: true, rps: 600, p99Ms: 140, version: 'v2.3.0', owner: 'Messaging team',
    description: 'Outbound email with DKIM signing and bounce handling.',
    capabilities: ['DKIM signing', 'Bounce handling', 'Suppression list'] },
  { id: 'chat', name: 'Chat', domain: MESSAGING, health: down('Websocket gateway rejected all connections after a certificate expired.'), docs: true, ui: false, rps: 350, p99Ms: 0, version: 'v0.9.4', owner: 'Messaging team',
    description: 'Realtime chat between customers and support agents.',
    capabilities: ['Websocket channels', 'Typing indicators', 'Transcript export'] },
  { id: 'notify', name: 'Notifications', domain: MESSAGING, health: HEALTHY, docs: true, ui: true, rps: 900, p99Ms: 120, version: 'v1.19.0', owner: 'Messaging team',
    description: 'One API for email, SMS and push. Handles templates, user preferences, rate limits and delivery receipts.',
    capabilities: ['Email, SMS and push', 'Template rendering', 'Quiet hours and opt-out', 'Delivery receipts'], dependsOn: ['eventbus'] },
  // Data & Storage — stepped
  { id: 'backup', name: 'Backup', domain: DATA, health: HEALTHY, docs: false, ui: false, rps: 200, p99Ms: 300, version: 'v1.4.0', owner: 'Storage team',
    description: 'Nightly snapshots of every database with point-in-time restore.',
    capabilities: ['Nightly snapshots', 'Point-in-time restore', 'Cross-region copies'] },
  { id: 'search', name: 'Search', domain: DATA, health: degraded('One of three index shards is rebuilding; results may be incomplete.'), docs: true, ui: true, rps: 1600, p99Ms: 260, version: 'v7.1.1', owner: 'Data team',
    description: 'Full-text and faceted search over catalog and orders.',
    capabilities: ['Full-text search', 'Facets', 'Synonyms'], dependsOn: ['catalog'] },
  { id: 'media', name: 'Media Storage', domain: DATA, health: deploying(60), docs: true, ui: false, rps: 600, p99Ms: 85, version: 'v2.4.0', owner: 'Storage team',
    description: 'Object storage for images, video and documents. Generates thumbnails and signed URLs, backed by a CDN edge.',
    capabilities: ['Signed upload and download URLs', 'Image transforms', 'Lifecycle rules', 'CDN edge caching'], dependsOn: ['identity'] },
  { id: 'analytics', name: 'Analytics', domain: DATA, health: down('Query workers out of memory after a schema migration.'), docs: false, ui: true, rps: 450, p99Ms: 0, version: 'v3.3.0', owner: 'Data team',
    description: 'Dashboards and ad-hoc queries over the event warehouse.',
    capabilities: ['Dashboards', 'Ad-hoc SQL', 'Scheduled reports'] },
  { id: 'metrics', name: 'Metrics Store', domain: DATA, health: HEALTHY, docs: true, ui: true, rps: 1900, p99Ms: 33, version: 'v2.8.0', owner: 'Data team',
    description: 'Time-series storage for service metrics with downsampling.',
    capabilities: ['Time-series ingest', 'Downsampling', 'PromQL-compatible queries'] },
];

export const mockServices: readonly Service[] = seeds.map(toService);
