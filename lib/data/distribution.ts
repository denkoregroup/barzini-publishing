import type { DistributionChannel, SyncEvent } from '@/lib/types'
// import { lgFetch } from '@/lib/labelgrid/client'

export async function getDistributionStatus(): Promise<DistributionChannel[]> {
  // TODO: reads from Supabase distro_events table (webhook-driven) — NOT a direct lgFetch call.
  // Distribution is webhook-driven only. lgFetch('/queues/distro') is a reconciliation
  // fallback only, not the primary data source. See architecture doc.
  return [
    {
      platform: 'Spotify',
      connected: true,
      lastSyncAt: '2026-06-15T18:52:00Z',
      status: 'healthy',
      deliveryCount: 4,
    },
    {
      platform: 'Apple Music',
      connected: true,
      lastSyncAt: '2026-06-15T18:52:00Z',
      status: 'healthy',
      deliveryCount: 3,
    },
    {
      platform: 'YouTube Music',
      connected: true,
      lastSyncAt: '2026-06-15T16:10:00Z',
      status: 'healthy',
      deliveryCount: 0,
    },
    {
      platform: 'Tidal',
      connected: false,
      lastSyncAt: '2026-06-13T09:00:00Z',
      status: 'warning',
      errorMessage: 'Authentication token expired — reconnect required',
      deliveryCount: 2,
    },
    {
      platform: 'Amazon Music',
      connected: true,
      lastSyncAt: '2026-06-15T17:30:00Z',
      status: 'healthy',
      deliveryCount: 1,
    },
    {
      platform: 'Other DSPs',
      connected: true,
      lastSyncAt: '2026-06-15T14:00:00Z',
      status: 'healthy',
      deliveryCount: 0,
    },
  ]
}

export async function getSyncEvents(): Promise<SyncEvent[]> {
  // TODO: reads from Supabase distro_events table, filtered to recent events.
  // See architecture doc: webhook-driven, not a direct lgFetch call.
  return [
    {
      id: 'evt-001',
      platform: 'Spotify',
      eventType: 'delivery',
      message: 'Midnight Tide delivered to Spotify',
      occurredAt: '2026-06-15T18:52:00Z',
    },
    {
      id: 'evt-002',
      platform: 'Apple Music',
      eventType: 'delivery',
      message: 'Midnight Tide delivered to Apple Music',
      occurredAt: '2026-06-15T18:51:00Z',
    },
    {
      id: 'evt-003',
      platform: 'Spotify',
      eventType: 'sync',
      message: 'Routine sync completed — all assets verified',
      occurredAt: '2026-06-15T16:10:00Z',
    },
    {
      id: 'evt-004',
      platform: 'Amazon Music',
      eventType: 'delivery',
      message: 'Low Country delivered to Amazon Music',
      occurredAt: '2026-06-15T14:20:00Z',
    },
    {
      id: 'evt-005',
      platform: 'Tidal',
      eventType: 'error',
      message: 'Tidal sync failed — authentication token expired',
      occurredAt: '2026-06-13T09:00:00Z',
    },
    {
      id: 'evt-006',
      platform: 'All platforms',
      eventType: 'payout',
      message: 'Payout processed for Theo Marsh — $4,210.00',
      occurredAt: '2026-06-12T11:00:00Z',
    },
    {
      id: 'evt-007',
      platform: 'Spotify',
      eventType: 'delivery',
      message: 'Undertow delivered to Spotify',
      occurredAt: '2026-06-11T09:15:00Z',
    },
    {
      id: 'evt-008',
      platform: 'Apple Music',
      eventType: 'sync',
      message: 'Metadata refresh completed for Harbour Lights',
      occurredAt: '2026-06-10T15:40:00Z',
    },
    {
      id: 'evt-009',
      platform: 'All platforms',
      eventType: 'payout',
      message: 'Payout processed for Nine Rivers — $2,890.00',
      occurredAt: '2026-06-09T10:00:00Z',
    },
    {
      id: 'evt-010',
      platform: 'Tidal',
      eventType: 'delivery',
      message: 'Undertow delivered to Tidal',
      occurredAt: '2026-06-08T08:30:00Z',
    },
  ]
}
