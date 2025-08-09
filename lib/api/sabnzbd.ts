import { SABnzbdServerStats } from './sabnzbd-types'
// SABnzbd API integration layer
export interface SABnzbdQueue {
  // qstatus fields are flat; normalize into our shape
  status: boolean
  paused: boolean
  speed: string
  timeLeft: string
  totalSize: string
  remainingSize: string
  diskSpaceLeft?: string
  diskSpaceTotal?: string
  kbpersec?: string
  eta?: string
  nzo_ids?: string
  slots: QueueSlot[]
}

export type SabPriority =
  | 'Paused' | 'Low' | 'Normal' | 'High' | 'Force'
  // Numeric fallbacks used by SAB internally (-2..2)
  | '-2' | '-1' | '0' | '1' | '2'

export interface QueueSlot {
  nzo_id: string
  filename: string
  size: string
  sizeleft: string
  percentage: number
  status: string
  priority: string
  category: string
  eta: string
  speed: string
}

export interface SABnzbdHistory {
  slots: HistorySlot[]
}

export interface HistorySlot {
  nzo_id: string
  name: string
  size: string
  status: string
  completed: string
  category: string
  downloadTime: string
  postProcessing: string
}

export class SABnzbdAPI {
  private baseUrl: string
  private apiKey: string
  private bypassHeaderName?: string
  private bypassHeaderValue?: string

  constructor(baseUrl: string, apiKey: string) {
    const trimmed = (baseUrl || '').replace(/\/+$/,'')
    this.baseUrl = trimmed
    this.apiKey = apiKey
    // Client should not read or set Traefik bypass headers; server proxies handle this in remote mode.
    this.bypassHeaderName = undefined
    this.bypassHeaderValue = undefined
    // If using proxy mode, allow base to be relative so we avoid CORS
    // When baseUrl starts with /api/sabnzbd (or legacy /api/sab), we won't append /sabnzbd/api below.
  }

  // Canonical API base: ensure `${BASE}/sabnzbd/api`
  private get apiBase(): string {
    const noTrailing = this.baseUrl.replace(/\/+$/,'')
    // If caller passed the internal proxy base, keep it as-is (no SAB suffixes)
    if (noTrailing.startsWith('/api/sabnzbd') || noTrailing.startsWith('/api/sab')) return noTrailing
    if (/\/sabnzbd\/api$/.test(noTrailing)) return noTrailing
    if (/\/sabnzbd$/.test(noTrailing)) return `${noTrailing}/api`
    return `${noTrailing}/sabnzbd/api`
  }

  private get isProxy(): boolean {
    try {
      const base = this.apiBase
      return base.startsWith('/api/sab')
    } catch {
      return false
    }
  }

  private keyParam(): string {
    return this.isProxy ? '' : `&apikey=${encodeURIComponent(this.apiKey)}`
  }

  // Build fetch options; client never attaches Traefik or API secrets
  private buildOptions(options?: RequestInit): RequestInit {
    const init: RequestInit = { ...(options || {}) }
    return init
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, this.buildOptions(options));
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SABnzbd API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  private async fetchNoContent(url: string, options?: RequestInit): Promise<void> {
    const response = await fetch(url, this.buildOptions(options));
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SABnzbd API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  // Queue/status operations - prefer mode=queue for both summary and items (qstatus not implemented on some installs)
  async getQueue(): Promise<SABnzbdQueue> {
    // Primary: use mode=queue for summary + items (full queue output with default paging)
    const detailed = await this.fetchJson<any>(`${this.apiBase}?mode=queue&start=0&limit=50${this.keyParam()}&output=json`)
    const q = detailed?.queue ?? {}
    const normalized: SABnzbdQueue = {
      status: (String(q.status || '').toLowerCase() === 'downloading') || (Number(q.kbpersec || 0) > 0),
      paused: !!q.paused,
      speed: typeof q.kbpersec !== 'undefined'
        ? `${(Number(q.kbpersec) / 1024).toFixed(2)} MB/s`
        : (q.speed && q.speed !== '0' ? `${Number(q.speed) / (1024*1024)} MB/s` : '0 MB/s'),
      timeLeft: q.timeleft ?? '-',
      totalSize: q.mb ? `${q.mb} MB` : (q.size || '-'),
      remainingSize: q.mbleft ? `${q.mbleft} MB` : (q.sizeleft || '-'),
      diskSpaceLeft: q.diskspace2 ? `${q.diskspace2} GB` : (q.diskspace2_norm || undefined),
      diskSpaceTotal: q.diskspace1 ? `${q.diskspace1} GB` : (q.diskspace1_norm || undefined),
      kbpersec: typeof q.kbpersec !== 'undefined' ? String(q.kbpersec) : undefined,
      eta: q.timeleft,
      nzo_ids: undefined,
      slots: Array.isArray(q.slots) ? q.slots.map((s: any) => ({
        nzo_id: s.nzo_id ?? s.nzoid ?? s.NZO_id ?? '',
        filename: s.filename ?? s.name ?? '',
  size: s.size ?? (s.mb ? `${s.mb} MB` : ''),
  sizeleft: s.sizeleft ?? (s.mbleft ? `${s.mbleft} MB` : ''),
        percentage: typeof s.percentage === 'number' ? s.percentage : Number(s.percentage ?? 0),
        status: s.status ?? s.state ?? '',
        priority: typeof s.priority === 'string' ? s.priority : (typeof s.priority === 'number' ? String(s.priority) : 'Normal'),
        category: s.cat ?? s.category ?? '',
        eta: s.timeleft ?? s.eta ?? '',
        speed: s.kbpersec ? `${(Number(s.kbpersec) / 1024).toFixed(2)} MB/s` : (s.speed ?? '')
      })) : []
    }

    // qstatus is deprecated/not implemented on some installs; we do not call it anymore.
    return normalized
  }

  /**
   * Full queue output (SAB 4.5) with optional filters.
   * Params:
   *  - start: index offset (default 0)
   *  - limit: number of items (default 50)
   *  - cat: optional category filter
   *  - priority: optional priority filter (-2..2 or labels)
   *  - search: optional substring search
   *  - nzo_ids: optional array of NZO IDs to include (comma-separated)
   */
  async getQueueDetails(
    start = 0,
    limit = 50,
    opts?: {
      cat?: string
      priority?: string
      search?: string
      nzo_ids?: string[] | string
    }
  ): Promise<{ slots: any[]; count?: number; raw?: any }> {
    const params = new URLSearchParams({
      mode: 'queue',
      start: String(start),
      limit: String(limit),
      output: 'json'
    })
    if (!this.isProxy) params.set('apikey', this.apiKey)
    if (opts?.cat) params.set('cat', opts.cat)
    if (opts?.priority) params.set('priority', opts.priority)
    if (opts?.search) params.set('search', opts.search)
    if (opts?.nzo_ids) {
      const ids = Array.isArray(opts.nzo_ids) ? opts.nzo_ids.join(',') : opts.nzo_ids
      if (ids) params.set('nzo_ids', ids)
    }

    const detailed = await this.fetchJson<any>(`${this.apiBase}?${params.toString()}`)
    const slots = detailed?.queue?.slots || []
    const count = detailed?.queue?.noofslots_total ?? detailed?.queue?.noofslots ?? undefined
    return { slots, count, raw: detailed?.queue }
  }

  async pauseQueue(): Promise<void> {
    // 4.5: pause (queue)
    await this.fetchNoContent(`${this.apiBase}?mode=pause${this.keyParam()}`);
  }

  async resumeQueue(): Promise<void> {
    // 4.5: resume (queue)
    await this.fetchNoContent(`${this.apiBase}?mode=resume${this.keyParam()}`);
  }

  async deleteItem(nzoId: string): Promise<void> {
    // 4.5: queue name=delete value=NZO_ID
    await this.fetchNoContent(`${this.apiBase}?mode=queue&name=delete&value=${encodeURIComponent(nzoId)}${this.keyParam()}`);
  }

  async pauseItem(nzoId: string): Promise<void> {
    // 4.5: queue name=pause value=NZO_ID
    await this.fetchNoContent(`${this.apiBase}?mode=queue&name=pause&value=${encodeURIComponent(nzoId)}${this.keyParam()}`);
  }

  async resumeItem(nzoId: string): Promise<void> {
    // 4.5: queue name=resume value=NZO_ID
    await this.fetchNoContent(`${this.apiBase}?mode=queue&name=resume&value=${encodeURIComponent(nzoId)}${this.keyParam()}`);
  }

  async moveItem(nzoId: string, position: number): Promise<void> {
    // 4.5: switch value=NZO_ID value2=NEWPOS (0-based/1-based accepted by SAB)
    await this.fetchNoContent(`${this.apiBase}?mode=switch&value=${encodeURIComponent(nzoId)}&value2=${encodeURIComponent(String(position))}${this.keyParam()}`);
  }

  async setPriority(nzoId: string, priority: SabPriority): Promise<void> {
    // 4.5: queue name=priority value=NZO_ID value2={priority label or -2..2}
    await this.fetchNoContent(`${this.apiBase}?mode=queue&name=priority&value=${encodeURIComponent(nzoId)}&value2=${encodeURIComponent(priority)}${this.keyParam()}`);
  }

  // 4.5: change_cat value=CATEGORY value2=NZO_ID
  async setCategory(nzoId: string, category: string): Promise<void> {
    await this.fetchNoContent(`${this.apiBase}?mode=change_cat&value=${encodeURIComponent(category)}&value2=${encodeURIComponent(nzoId)}${this.keyParam()}`);
  }

  // History operations (SAB 4.5 full history output with filters)
  async getHistory(
    start = 0,
    limit = 50,
    opts?: {
      cat?: string
      search?: string
      nzo_ids?: string[] | string
      failed_only?: 0 | 1 | '0' | '1' | boolean
    }
  ): Promise<{ slots: any[]; count?: number; raw?: any }> {
    const params = new URLSearchParams({
      mode: 'history',
      start: String(start),
      limit: String(limit),
      output: 'json',
    })
    if (!this.isProxy) params.set('apikey', this.apiKey)
    if (opts?.cat) params.set('cat', opts.cat)
    if (opts?.search) params.set('search', opts.search)
    if (opts?.nzo_ids) {
      const ids = Array.isArray(opts.nzo_ids) ? opts.nzo_ids.join(',') : opts.nzo_ids
      if (ids) params.set('nzo_ids', ids)
    }
    if (typeof opts?.failed_only !== 'undefined') {
      const val = typeof opts.failed_only === 'boolean' ? (opts.failed_only ? '1' : '0') : String(opts.failed_only)
      params.set('failed_only', val === '1' ? '1' : '0')
    } else {
      params.set('failed_only', '0')
    }
    const detailed = await this.fetchJson<any>(`${this.apiBase}?${params.toString()}`)
    const hist = detailed?.history ?? detailed
    const slots = hist?.slots || []
    const count = hist?.noofslots_total ?? hist?.noofslots ?? undefined
    return { slots, count, raw: hist }
  }

  async deleteHistoryItem(nzoId: string): Promise<void> {
    await this.fetchNoContent(`${this.apiBase}?mode=history&name=delete&value=${encodeURIComponent(nzoId)}${this.keyParam()}`);
  }

  // Status and stats (qstatus deprecated) - use queue for live status summary
  async getStatus(): Promise<any> {
    // Return the same normalized structure we use for the dashboard header by leveraging getQueue
    return this.getQueue()
  }

  async getServerStats(): Promise<SABnzbdServerStats> {
    return this.fetchJson<SABnzbdServerStats>(`${this.apiBase}?mode=server_stats${this.keyParam()}&output=json`);
  }

  // Configuration
  async getConfig(): Promise<any> {
    return this.fetchJson<any>(`${this.apiBase}?mode=get_config${this.keyParam()}&output=json`);
  }

  // New: Get categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.getConfig();
      const categoriesString = response?.config?.categories?.value;
      return categoriesString ? categoriesString.split(',') : [];
    } catch (error) {
      console.error("Failed to fetch SABnzbd categories:", error);
      return []; // Return empty array on error
    }
  }

  async setConfig(section: string, keyword: string, value: string): Promise<void> {
    await this.fetchNoContent(`${this.apiBase}?mode=set_config&section=${encodeURIComponent(section)}&keyword=${encodeURIComponent(keyword)}&value=${encodeURIComponent(value)}${this.keyParam()}`);
  }

  // Add NZB
  async addNzb(nzbData: string, name?: string, category?: string, priority?: string): Promise<void> {
    const formData = new FormData()
    formData.append('nzbfile', new Blob([nzbData]), name || 'download.nzb')
    if (category) formData.append('cat', category)
    if (priority) formData.append('priority', priority)
    if (!this.isProxy) formData.append('apikey', this.apiKey)

    await this.fetchNoContent(`${this.apiBase}?mode=addfile`, {
      method: 'POST',
      body: formData
    })
  }

  async addUrl(url: string, name?: string, category?: string, priority?: string): Promise<void> {
    const params = new URLSearchParams({
      mode: 'addurl',
      name: url
    })
    if (!this.isProxy) params.append('apikey', this.apiKey)
    if (name) params.append('nzbname', name)
    if (category) params.append('cat', category)
    if (priority) params.append('priority', priority)
    await this.fetchNoContent(`${this.apiBase}?${params}`);
  }
}
