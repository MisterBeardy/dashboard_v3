"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Film, Search, Plus, Bookmark, BookmarkIcon as BookmarkOff, Download, Calendar, BarChart3, Settings, MoreHorizontal, Star, Clock, HardDrive, CheckCircle, XCircle, Edit, Filter, Trash2, RefreshCw, Cpu, Activity, AlertTriangle, Info, Zap } from 'lucide-react'
import { useMemo, useState, useEffect } from "react"
import { ModuleLogViewer } from "./module-log-viewer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
// import { useRadarr } from "@/hooks/use-radarr"

interface RadarrDashboardProps {
  displayMode?: 'table' | 'poster'
}

const isDev = process.env.NODE_ENV !== 'production'

// Minimal dev-only sample to preserve UI shape in development
const devMovies = [
  { id: 1, title: 'Sample Movie', year: 2024, status: 'released', monitored: true, runtime: 120, sizeOnDisk: '—', qualityProfile: 'HD-1080p', studio: '—', inCinemas: null, physicalRelease: null, poster: '/placeholder.svg', overview: 'Dev sample movie', tags: [1] }
]

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function RadarrDashboard({ displayMode = 'table' }: RadarrDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMonitored, setSelectedMonitored] = useState('all')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedMonitored, setEditedMonitored] = useState(false)
  const [editedQualityProfile, setEditedQualityProfile] = useState('')
  const [editedTags, setEditedTags] = useState('')

  // Use the internal proxy route; server-side envs inject credentials/headers
  const radarrEnabled = true
  // Placeholder for useRadarr hook until it's implemented
  const useRadarr = () => ({
    movies: [],
    wanted: [],
    calendar: [],
    activity: { records: [] },
    systemStatus: {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      appData: '/config',
      osName: 'Linux',
      osVersion: '5.4.0',
      architecture: 'x64',
      runtimeVersion: '18.0.0'
    },
    systemHealth: [],
    diskSpace: [],
    systemTasks: [],
    updateInfo: {
      version: '1.0.0',
      latestVersion: '1.0.0',
      updateAvailable: false,
      changes: []
    },
    qualityProfiles: [],
    rootFolders: [],
    lookupResults: [{ id: 1, title: 'Sample Movie', tmdbId: 123, titleSlug: 'sample-movie', images: [] }],
    actions: {
      searchAllMissing: async () => {},
      movies: {
        toggleMonitoring: async (id: number) => {},
        searchMovie: async (id: number) => {},
        deleteMovie: async (id: number) => {},
        addMovie: async (movie: any) => {}
      },
      lookupMovie: async (term: string) => {}
    },
    fetch: {
      movies: async () => {},
      wanted: async () => {},
      calendar: async () => {},
      activity: async () => {},
      systemStatus: async () => {},
      systemHealth: async () => {},
      diskSpace: async () => {},
      systemTasks: async () => {},
      updateInfo: async () => {},
      qualityProfiles: async () => {},
      rootFolders: async () => {}
    },
    loading: false
  })
  
  const { movies, wanted, calendar, activity, systemStatus, systemHealth, diskSpace, systemTasks, updateInfo, qualityProfiles, rootFolders, lookupResults, actions, fetch, loading } =
    useRadarr()

  // Type for a movie item (best-effort shape)
  type MovieItem = typeof devMovies[number] & Partial<{
    id: number
    title: string
    year: number
    status: string
    monitored: boolean
    runtime: number
    sizeOnDisk: string
    qualityProfile: string
    studio: string
    inCinemas: string | null
    physicalRelease: string | null
    poster: string | null
    overview: string
    tags: number[]
  }>

  const [movieToEdit, setMovieToEdit] = useState<MovieItem | null>(null)

  // Add Movie dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addSearchTerm, setAddSearchTerm] = useState('')
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)
  const [selectedQualityProfileId, setSelectedQualityProfileId] = useState<number | ''>('')
  const [selectedRootFolderPath, setSelectedRootFolderPath] = useState<string>('')
  const [addMonitored, setAddMonitored] = useState(true)

  // Persist and react to tab selection
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'movies'
    try { return localStorage.getItem('radarr_tabs_selected') || 'movies' } catch { return 'movies' }
  })
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem('radarr_tabs_selected', selectedTab) } catch {}
    if (!radarrEnabled) return
    if (selectedTab === 'calendar') {
      fetch.calendar()
    } else if (selectedTab === 'wanted') {
      fetch.wanted()
    } else if (selectedTab === 'activity') {
      fetch.activity()
    } else if (selectedTab === 'system') {
      fetch.systemStatus()
      fetch.systemHealth()
      fetch.diskSpace()
      fetch.systemTasks()
      fetch.updateInfo()
    }
  }, [selectedTab, radarrEnabled, fetch.calendar, fetch.wanted, fetch.activity, fetch.systemStatus, fetch.systemHealth, fetch.diskSpace, fetch.systemTasks, fetch.updateInfo])

  // Load catalogs when Add Movie dialog opens
  useEffect(() => {
    if (!isAddDialogOpen) return
    fetch.qualityProfiles()
    fetch.rootFolders()
  }, [isAddDialogOpen, fetch])

  // Compute effective data with dev-only fallback
  const effectiveMovies: MovieItem[] = useMemo(() => {
    if (movies && Array.isArray(movies) && movies.length) return (movies as unknown) as MovieItem[]
    return isDev ? (devMovies as MovieItem[]) : []
  }, [movies])

  const effectiveWanted = useMemo(() => {
    if (wanted && Array.isArray(wanted)) return wanted as unknown as any[]
    return isDev ? [] : []
  }, [wanted])

  const effectiveCalendar = useMemo(() => {
    if (calendar && Array.isArray(calendar)) return calendar as unknown as any[]
    return isDev ? [] : []
  }, [calendar])

  const activityData = activity?.records?.map((record: any) => ({
    id: record.id,
    eventType: record.eventType,
    movieTitle: record.movie?.title || 'Unknown Movie',
    quality: record.quality?.quality?.name || 'Unknown',
    date: new Date(record.date).toLocaleString(),
    successful: !record.eventType.includes('failed')
  })) || []

  const handleMovieAction = async (action: string, movieId?: number) => {
    if (!movieId || !radarrEnabled) return
    
    switch (action) {
      case 'toggle_monitor':
        if ('toggleMonitoring' in actions.movies) {
          await actions.movies.toggleMonitoring(movieId)
        }
        break
      case 'search':
        if ('searchMovie' in actions.movies) {
          await actions.movies.searchMovie(movieId)
        }
        break
      case 'delete':
        if ('deleteMovie' in actions.movies) {
          await actions.movies.deleteMovie(movieId)
        }
        break
      default:
        console.log(`Unknown movie action: ${action}`, movieId)
    }
  }

  const handleEditClick = (m: MovieItem) => {
    setMovieToEdit(m)
    setEditedMonitored(!!m.monitored)
    setEditedQualityProfile(m.qualityProfile || '')
    const tags = Array.isArray(m.tags) ? m.tags : []
    setEditedTags(tags.join(', '))
    setIsEditDialogOpen(true)
  }

  const handleSaveMovieEdit = async () => {
    if (movieToEdit && radarrEnabled) {
      const updatedMovie: MovieItem = {
        ...movieToEdit,
        monitored: editedMonitored,
        qualityProfile: editedQualityProfile,
        tags: editedTags.split(',').map(tag => parseInt(tag.trim())).filter(tag => !isNaN(tag)),
      }
      
      try {
        if ('toggleMonitoring' in actions.movies && updatedMovie.monitored !== movieToEdit.monitored) {
          await actions.movies.toggleMonitoring(movieToEdit.id)
        }
        // Note: Quality profile and tags updates would need additional API methods
        console.log('Saving updated movie:', updatedMovie)
        setIsEditDialogOpen(false)
        setMovieToEdit(null)
        // Refresh the movie data
        fetch.movies()
      } catch (error) {
        console.error('Failed to save movie:', error)
      }
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!radarrEnabled) return
    
    try {
      if ('deleteMovie' in actions.movies) {
        await actions.movies.deleteMovie(movieId)
        // Refresh the movie data
        fetch.movies()
      }
    } catch (error) {
      console.error('Failed to delete movie:', error)
    }
  };

  const handleRefreshMovie = async (movieId: number) => {
    if (!radarrEnabled) return
    
    try {
      if ('searchMovie' in actions.movies) {
        await actions.movies.searchMovie(movieId)
        // Refresh the activity data
        fetch.activity()
      }
    } catch (error) {
      console.error('Failed to refresh movie:', error)
    }
  };

  const handleScanMovie = async (movieId: number) => {
    if (!radarrEnabled) return
    
    try {
      if ('searchMovie' in actions.movies) {
        // For now, we'll use the searchMovie method which triggers a search
        await actions.movies.searchMovie(movieId)
        // Refresh the activity data
        fetch.activity()
      }
    } catch (error) {
      console.error('Failed to scan movie:', error)
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'default'
      case 'announced': return 'secondary'
      case 'downloaded': return 'default'
      case 'wanted': return 'destructive'
      case 'missing': return 'destructive'
      case 'unreleased': return 'outline'
      default: return 'outline'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'grabbed': return <Download className="h-4 w-4 text-blue-500" />
      case 'downloadFolderImported': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'downloadFailed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredMovies = effectiveMovies.filter((movie: MovieItem) => {
    const title = (movie.title || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || movie.status === selectedStatus
    const matchesMonitored = selectedMonitored === 'all' ||
      (selectedMonitored === 'monitored' && !!movie.monitored) ||
      (selectedMonitored === 'unmonitored' && !movie.monitored)
    return matchesSearch && matchesStatus && matchesMonitored
  })

  return (
    <div className="space-y-4">
      {/* Header with Global Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Radarr</h2>
          <p className="text-muted-foreground">Movie Management</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await actions.searchAllMissing()
                fetch.activity()
              } catch (e) {
                console.error(e)
              }
            }}
            disabled={loading}
          >
            <Search className="h-4 w-4 mr-1" />
            Search All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Movie
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{effectiveMovies.length}</div>
            <p className="text-xs text-muted-foreground">
              {/* total size placeholder */}
              — total size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Wanted Movies</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{Array.isArray(effectiveWanted) ? effectiveWanted.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {/* downloading count requires activity endpoint; placeholder */}
              0 downloading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              of — used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Quality</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">HD-1080p</div>
            <p className="text-xs text-muted-foreground">
              Default profile
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v)} className="space-y-3">
        <TabsList>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="wanted">Wanted</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger> {/* Added Statistics Tab */}
          <TabsTrigger value="system">System</TabsTrigger> {/* New System Status Tab */}
          <TabsTrigger value="logs">Logs</TabsTrigger> {/* New Logs Tab */}
        </TabsList>

        {/* Movies Tab */}
        <TabsContent value="movies" className="space-y-3">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="grid gap-2 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search movies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                      <SelectItem value="announced">Announced</SelectItem>
                      <SelectItem value="inCinemas">In Cinemas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Monitored</label>
                  <Select value={selectedMonitored} onValueChange={setSelectedMonitored}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="monitored">Monitored</SelectItem>
                      <SelectItem value="unmonitored">Unmonitored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Actions</label>
                  <Button variant="outline" className="w-full h-9">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Movie
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movies List */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Movie Library
              </CardTitle>
              <CardDescription>
                Manage your movie collection
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              {displayMode === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Runtime</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Studio</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovies.map((movie: MovieItem) => (
                        <TableRow key={movie.id}>
                          <TableCell className="font-medium">{movie.title}</TableCell>
                          <TableCell>{movie.year}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(movie.status) as any}>
                              {movie.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{movie.runtime} min</TableCell>
                          <TableCell>{movie.sizeOnDisk}</TableCell>
                          <TableCell>{movie.qualityProfile}</TableCell>
                          <TableCell>{movie.studio}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleMovieAction('toggle_monitor', movie.id)}
                              >
                                {movie.monitored ? (
                                  <Bookmark className="h-4 w-4 text-green-500" />
                                ) : (
                                  <BookmarkOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Search className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditClick(movie)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRefreshMovie(movie.id)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Movie
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleScanMovie(movie.id)}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Scan Movie
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMovie(movie.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Movie
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMovies.map((movie: MovieItem) => (
                    <div key={movie.id} className="border rounded-lg p-2">
                      <div className="flex items-start gap-2">
                        <img 
                          src={movie.poster || "/placeholder.svg"} 
                          alt={movie.title}
                          className="w-14 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="font-medium text-base">{movie.title}</h3>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <span>({movie.year})</span>
                                <Badge variant={getStatusColor(movie.status) as any}>
                                  {movie.status}
                                </Badge>
                                <span>{movie.studio}</span>
                                <span>{movie.qualityProfile}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleMovieAction('toggle_monitor', movie.id)}
                              >
                                {movie.monitored ? (
                                  <Bookmark className="h-4 w-4 text-green-500" />
                                ) : (
                                  <BookmarkOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Search className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditClick(movie)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRefreshMovie(movie.id)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Movie
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleScanMovie(movie.id)}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Scan Movie
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMovie(movie.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Movie
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {movie.overview}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Runtime:</span>
                              <span className="ml-1 font-medium">{movie.runtime} min</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Size:</span>
                              <span className="ml-1 font-medium">{movie.sizeOnDisk}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">In Cinemas:</span>
                              <span className="ml-1 font-medium">
                                {movie.inCinemas ? new Date(movie.inCinemas).toLocaleDateString() : 'TBA'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Physical:</span>
                              <span className="ml-1 font-medium">
                                {movie.physicalRelease ? new Date(movie.physicalRelease).toLocaleDateString() : 'TBA'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Movies
              </CardTitle>
              <CardDescription>
                Movies releasing in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-3">
                {(effectiveCalendar || []).map((day: any) => (
                  <div key={day.date}>
                    <h3 className="font-medium mb-2 text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="space-y-1">
                      {day.movies && day.movies.map((movie: any) => (
                        <div key={`${movie.id || movie.title}-${day.date}`} className="border rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{movie.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {movie.year} • {movie.studio}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <span>{movie.runtime} min</span>
                                <Badge variant={movie.hasFile ? 'default' : 'destructive'}>
                                  {movie.hasFile ? 'Downloaded' : 'Missing'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wanted Tab */}
        <TabsContent value="wanted" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Wanted Movies
              </CardTitle>
              <CardDescription>
                Movies that are monitored but not downloaded
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {(effectiveWanted || []).map((movie: any) => (
                  <div key={movie.id} className="border rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{movie.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {movie.year} • {movie.studio}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{movie.runtime} min</span>
                          <Badge variant="destructive">Wanted</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                          onClick={async () => {
                            if (radarrEnabled && 'searchMovie' in actions.movies && movie.id) {
                              try {
                                await actions.movies.searchMovie(movie.id)
                                fetch.activity()
                              } catch (error) {
                                console.error('Failed to search movie:', error)
                              }
                            }
                          }}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Search
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest downloads and system events
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {activityData.map((activity: any, index: number) => (
                  <div key={`activity-${activity.id || index}`} className="border rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      {getEventTypeIcon(activity.eventType)}
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-medium capitalize text-sm">
                            {activity.eventType.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Badge variant={activity.successful ? 'default' : 'destructive'}>
                            {activity.successful ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm">{activity.movieTitle}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{activity.quality}</span>
                          <span>{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Library Overview
                </CardTitle>
                <CardDescription>Key metrics for your movie library</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Movies</span>
                    <span className="font-medium">{effectiveMovies.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloaded Movies</span>
                    <span className="font-medium">
                      {effectiveMovies.filter(m => m.sizeOnDisk && m.sizeOnDisk !== '—').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing Movies</span>
                    <span className="font-medium text-destructive">
                      {Math.max(
                        0,
                        effectiveMovies.filter(m => !m.sizeOnDisk || m.sizeOnDisk === '—').length
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monitored Movies</span>
                    <span className="font-medium">
                      {effectiveMovies.filter(m => !!m.monitored).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unmonitored Movies</span>
                    <span className="font-medium">
                      {effectiveMovies.filter(m => !m.monitored).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Size on Disk</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Movie Size</span>
                    <span className="font-medium">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Movie Status Distribution
                </CardTitle>
                <CardDescription>Number of movies by their status</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {/* Unknown without real stats; placeholder empty state */}
                  <div className="text-sm text-muted-foreground">No status distribution available</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Quality Profile Distribution
                </CardTitle>
                <CardDescription>Movies count by quality profile</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {/* Unknown without real stats; placeholder empty state */}
                  <div className="text-sm text-muted-foreground">No quality profile data available</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Movie Activity
                </CardTitle>
                <CardDescription>Added vs. Missing movies over 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  <div className="text-sm text-muted-foreground">No daily activity data</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="system" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {/* System Status Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Current Radarr system information</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {systemStatus ? (
                    <>
                      <div className="flex justify-between">
                        <span>Version</span>
                        <span className="font-medium">{systemStatus.version || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Build Time</span>
                        <span className="font-medium">
                          {systemStatus.buildTime ? new Date(systemStatus.buildTime).toLocaleDateString() : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runtime</span>
                        <span className="font-medium">
                          {systemStatus.startTime ?
                            `${Math.floor((Date.now() - new Date(systemStatus.startTime).getTime()) / (1000 * 60 * 60 * 24))} days` :
                            '—'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>App Data</span>
                        <span className="font-medium">{systemStatus.appData || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OS</span>
                        <span className="font-medium">{systemStatus.osName || '—'} {systemStatus.osVersion || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Architecture</span>
                        <span className="font-medium">{systemStatus.architecture || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runtime Version</span>
                        <span className="font-medium">{systemStatus.runtimeVersion || '—'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No system status available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Health Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Health status of Radarr components</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {systemHealth && systemHealth.length > 0 ? (
                    systemHealth.map((health: any, index: number) => (
                      <div key={`health-${health.source || health.type}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {health.type === 'error' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span>{health.source || 'Unknown'}</span>
                        </div>
                        <Badge variant={health.type === 'error' ? 'destructive' : 'default'}>
                          {health.type || 'Unknown'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No health issues reported</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Disk Space Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Disk Space
                </CardTitle>
                <CardDescription>Storage information for Radarr</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-3 text-sm">
                  {diskSpace && diskSpace.length > 0 ? (
                    diskSpace.map((disk: any, index: number) => (
                      <div key={`disk-${disk.path || index}`} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{disk.path || 'Unknown'}</span>
                          <span>{disk.label || '—'}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{disk.freeSpace ? formatBytes(disk.freeSpace) : '—'} free</span>
                          <span>{disk.totalSpace ? formatBytes(disk.totalSpace) : '—'} total</span>
                        </div>
                        <Progress
                          value={disk.freeSpace && disk.totalSpace ?
                            ((disk.totalSpace - disk.freeSpace) / disk.totalSpace) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No disk space information available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Updates Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Updates
                </CardTitle>
                <CardDescription>Available updates for Radarr</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {updateInfo ? (
                    <>
                      <div className="flex justify-between">
                        <span>Current Version</span>
                        <span className="font-medium">{updateInfo.version || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latest Version</span>
                        <span className="font-medium">{updateInfo.latestVersion || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Update Available</span>
                        <Badge variant={updateInfo.updateAvailable ? 'default' : 'secondary'}>
                          {updateInfo.updateAvailable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {updateInfo.updateAvailable && (
                        <div className="flex justify-between">
                          <span>Changes</span>
                          <span className="font-medium">
                            {updateInfo.changes && updateInfo.changes.length > 0 ?
                              `${updateInfo.changes.length} changes` : '—'}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No update information available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Tasks */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Tasks
              </CardTitle>
              <CardDescription>Currently running system tasks</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2 text-sm">
                {systemTasks && systemTasks.length > 0 ? (
                  systemTasks.map((task: any, index: number) => (
                    <div key={`task-${task.name || task.id || index}`} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'running' ? 'bg-yellow-500' :
                          task.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className="font-medium">{task.name || 'Unknown Task'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'running' ? 'secondary' :
                          task.status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {task.status || 'Unknown'}
                        </Badge>
                        {task.startTime && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.startTime).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No system tasks running</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <ModuleLogViewer moduleName="Radarr" logs={[]} />
        </TabsContent>
      </Tabs>

      {/* Module Settings (proxy-only; no secrets exposed) */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Module Settings
          </CardTitle>
          <CardDescription>Connection overview (client-safe)</CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Connection Mode</div>
              <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                {process.env.NEXT_PUBLIC_BACKEND_TARGET || '—'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Proxy Endpoint</div>
              <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">/api/radarr</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Movie Dialog */}
      {movieToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Movie: {movieToEdit.title}</DialogTitle>
              <DialogDescription>
                Make changes to the movie settings here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="monitored" className="text-right">
                  Monitored
                </Label>
                <Switch
                  id="monitored"
                  checked={editedMonitored}
                  onCheckedChange={setEditedMonitored}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qualityProfile" className="text-right">
                  Quality Profile
                </Label>
                <Select value={editedQualityProfile} onValueChange={setEditedQualityProfile}>
                  <SelectTrigger id="qualityProfile" className="col-span-3">
                    <SelectValue placeholder="Select a quality profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {['HD-1080p','HD-720p','SD','4K-UHD'].map((profile: string) => (
                      <SelectItem key={`profile-${profile}`} value={profile}>
                        {profile}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  className="col-span-3"
                  placeholder="Comma-separated tags (e.g., 1, 2, 3)"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={handleSaveMovieEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Movie Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Movie</DialogTitle>
            <DialogDescription>Search and add a movie to Radarr</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm">Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., The Matrix"
                  value={addSearchTerm}
                  onChange={(e) => setAddSearchTerm(e.target.value)}
                  className="h-9"
                />
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => actions.lookupMovie(addSearchTerm)}
                  disabled={!addSearchTerm.trim() || loading}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Lookup
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Results</Label>
              <div className="max-h-48 overflow-y-auto border rounded">
                {Array.isArray(lookupResults) && lookupResults.length > 0 ? (
                  lookupResults.map((m: any) => (
                    <div
                      key={m.id}
                      className={`px-2 py-1 text-sm cursor-pointer ${selectedMovieId === m.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedMovieId(m.id)}
                      role="button"
                    >
                      {m.title} {m.year ? `(${m.year})` : ''}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground px-2 py-2">
                    No results yet. Enter a search term and click Lookup.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm">Quality Profile</Label>
                <Select
                  value={String(selectedQualityProfileId)}
                  onValueChange={(v) => setSelectedQualityProfileId(v ? Number(v) : '')}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {(qualityProfiles || []).map((q: any) => (
                      <SelectItem key={`quality-${q.id}`} value={String(q.id)}>{q.name || `Profile ${q.id}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Root Folder</Label>
                <Select
                  value={selectedRootFolderPath}
                  onValueChange={(v) => setSelectedRootFolderPath(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {(rootFolders || []).map((rf: any) => (
                      <SelectItem key={`folder-${rf.path}`} value={rf.path}>{rf.path}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Monitored</Label>
              <Switch checked={addMonitored} onCheckedChange={setAddMonitored} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                try {
                  const sel = (lookupResults || []).find((m: any) => m.id === selectedMovieId)
                  if (!sel || !selectedQualityProfileId || !selectedRootFolderPath) return
                  await actions.movies.addMovie({
                    title: sel.title,
                    tmdbId: sel.tmdbId,
                    titleSlug: sel.titleSlug,
                    images: sel.images,
                    qualityProfileId: selectedQualityProfileId as number,
                    rootFolderPath: selectedRootFolderPath,
                    monitored: addMonitored,
                    minimumAvailability: 'released',
                    addOptions: { searchForMovie: false },
                  } as any)
                  setIsAddDialogOpen(false)
                  setAddSearchTerm('')
                  setSelectedMovieId(null)
                  setSelectedQualityProfileId('')
                  setSelectedRootFolderPath('')
                  setAddMonitored(true)
                  fetch.movies()
                } catch (e) {
                  console.error('Failed to add movie', e)
                }
              }}
              disabled={!selectedMovieId || !selectedQualityProfileId || !selectedRootFolderPath}
            >
              Add Movie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}