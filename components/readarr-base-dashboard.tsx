"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Book, Search, Plus, Bookmark, BookmarkIcon as BookmarkOff, Download, Calendar, BarChart3, Settings, MoreHorizontal, Star, Clock, HardDrive, CheckCircle, XCircle, Edit, Filter, Trash2, RefreshCw, Cpu, Activity, AlertTriangle, Info, Zap, User, Library, Tag } from 'lucide-react'
import { useMemo, useState, useEffect } from "react"
import { ModuleLogViewer } from "./module-log-viewer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface ReadarrBaseDashboardProps {
  moduleName: string
  displayMode?: 'table' | 'poster'
  // Placeholder for hook until it's implemented
  useReadarrHook: () => any
}

const isDev = process.env.NODE_ENV !== 'production'

// Minimal dev-only sample to preserve UI shape in development
const devBooks = [
  { id: 1, title: 'Sample Book', authorName: 'Sample Author', releaseDate: '2023-01-01', statistics: { bookFileCount: 1, sizeOnDisk: 1000000 } }
]

const devAuthors = [
  { id: 1, name: 'Sample Author', bookCount: 1, statistics: { bookCount: 1, bookFileCount: 1, sizeOnDisk: 1000000 } }
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

export function ReadarrBaseDashboard({ moduleName, displayMode = 'table', useReadarrHook }: ReadarrBaseDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMonitored, setSelectedMonitored] = useState('all')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedMonitored, setEditedMonitored] = useState(false)
  const [editedQualityProfileId, setEditedQualityProfileId] = useState('')
  const [editedMetadataProfileId, setEditedMetadataProfileId] = useState('')
  const [editedTags, setEditedTags] = useState('')

  // Use the internal proxy route; server-side envs inject credentials/headers
  const readarrEnabled = true
  
  // Use the provided hook
  const { 
    books, 
    authors, 
    queue, 
    history, 
    systemStatus, 
    systemHealth, 
    systemTasks, 
    updateInfo, 
    notifications, 
    tags, 
    qualityProfiles, 
    metadataProfiles, 
    rootFolders, 
    downloadClients, 
    actions, 
    fetch, 
    loading 
  } = useReadarrHook()

  // Type for a book item (best-effort shape)
  type BookItem = typeof devBooks[number] & Partial<{
    id: number
    title: string
    authorName: string
    releaseDate: string
    statistics: {
      bookFileCount: number
      sizeOnDisk: number
    }
    monitored: boolean
    qualityProfileId: number
    metadataProfileId: number
    tags: number[]
    status: string
  }>

  // Type for an author item (best-effort shape)
  type AuthorItem = typeof devAuthors[number] & Partial<{
    id: number
    name: string
    bookCount: number
    statistics: {
      bookCount: number
      bookFileCount: number
      sizeOnDisk: number
    }
    monitored: boolean
    qualityProfileId: number
    metadataProfileId: number
    tags: number[]
    status: string
  }>

  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null)
  const [authorToEdit, setAuthorToEdit] = useState<AuthorItem | null>(null)

  // Add Book dialog state
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false)
  const [addBookSearchTerm, setAddBookSearchTerm] = useState('')
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [addBookMonitored, setAddBookMonitored] = useState(true)
  const [addBookQualityProfileId, setAddBookQualityProfileId] = useState('')
  const [addBookMetadataProfileId, setAddBookMetadataProfileId] = useState('')
  const [addBookRootFolderId, setAddBookRootFolderId] = useState('')

  // Add Author dialog state
  const [isAddAuthorDialogOpen, setIsAddAuthorDialogOpen] = useState(false)
  const [addAuthorSearchTerm, setAddAuthorSearchTerm] = useState('')
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null)
  const [addAuthorMonitored, setAddAuthorMonitored] = useState(true)
  const [addAuthorQualityProfileId, setAddAuthorQualityProfileId] = useState('')
  const [addAuthorMetadataProfileId, setAddAuthorMetadataProfileId] = useState('')
  const [addAuthorRootFolderId, setAddAuthorRootFolderId] = useState('')

  // Persist and react to tab selection
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'books'
    try { return localStorage.getItem(`${moduleName.toLowerCase()}_tabs_selected`) || 'books' } catch { return 'books' }
  })
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem(`${moduleName.toLowerCase()}_tabs_selected`, selectedTab) } catch {}
    if (!readarrEnabled) return
    if (selectedTab === 'authors') {
      // Fetch authors data
    } else if (selectedTab === 'queue') {
      // Fetch queue data
    } else if (selectedTab === 'history') {
      // Fetch history data
    } else if (selectedTab === 'system') {
      fetch.systemStatus()
      fetch.systemHealth()
      fetch.systemTasks()
      fetch.updateInfo()
    } else if (selectedTab === 'notifications') {
      // Fetch notifications data
    }
  }, [selectedTab, readarrEnabled, fetch.systemStatus, fetch.systemHealth, fetch.systemTasks, fetch.updateInfo])

  // Load catalogs when Add dialogs open
  useEffect(() => {
    if (!isAddBookDialogOpen && !isAddAuthorDialogOpen) return
    fetch.tags()
    fetch.qualityProfiles()
    fetch.metadataProfiles()
    fetch.rootFolders()
  }, [isAddBookDialogOpen, isAddAuthorDialogOpen, fetch.tags, fetch.qualityProfiles, fetch.metadataProfiles, fetch.rootFolders])

  // Compute effective data with dev-only fallback
  const effectiveBooks: BookItem[] = useMemo(() => {
    if (books && Array.isArray(books) && books.length) return (books as unknown) as BookItem[]
    return isDev ? (devBooks as BookItem[]) : []
  }, [books])

  const effectiveAuthors: AuthorItem[] = useMemo(() => {
    if (authors && Array.isArray(authors) && authors.length) return (authors as unknown) as AuthorItem[]
    return isDev ? (devAuthors as AuthorItem[]) : []
  }, [authors])

  const filteredBooks = effectiveBooks.filter((book: BookItem) => {
    const title = (book.title || '').toLowerCase()
    const author = (book.authorName || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || author.includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus
    const matchesMonitored = selectedMonitored === 'all' ||
      (selectedMonitored === 'monitored' && !!book.monitored) ||
      (selectedMonitored === 'unmonitored' && !book.monitored)
    return matchesSearch && matchesStatus && matchesMonitored
  })

  const filteredAuthors = effectiveAuthors.filter((author: AuthorItem) => {
    const name = (author.name || '').toLowerCase()
    const matchesSearch = name.includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || author.status === selectedStatus
    const matchesMonitored = selectedMonitored === 'all' ||
      (selectedMonitored === 'monitored' && !!author.monitored) ||
      (selectedMonitored === 'unmonitored' && !author.monitored)
    return matchesSearch && matchesStatus && matchesMonitored
  })

  const handleBookAction = async (action: string, bookId?: number) => {
    if (!bookId || !readarrEnabled) return
    
    switch (action) {
      case 'toggle_monitor':
        if ('toggleBookMonitor' in actions.books) {
          await actions.books.toggleBookMonitor(bookId)
        }
        break
      case 'search':
        if ('searchBook' in actions.books) {
          await actions.books.searchBook(bookId)
        }
        break
      case 'delete':
        if ('deleteBook' in actions.books) {
          await actions.books.deleteBook(bookId)
        }
        break
      default:
        console.log(`Unknown book action: ${action}`, bookId)
    }
  }

  const handleAuthorAction = async (action: string, authorId?: number) => {
    if (!authorId || !readarrEnabled) return
    
    switch (action) {
      case 'toggle_monitor':
        if ('toggleAuthorMonitor' in actions.authors) {
          await actions.authors.toggleAuthorMonitor(authorId)
        }
        break
      case 'search':
        if ('searchAuthor' in actions.authors) {
          await actions.authors.searchAuthor(authorId)
        }
        break
      case 'delete':
        if ('deleteAuthor' in actions.authors) {
          await actions.authors.deleteAuthor(authorId)
        }
        break
      default:
        console.log(`Unknown author action: ${action}`, authorId)
    }
  }

  const handleEditBookClick = (book: BookItem) => {
    setBookToEdit(book)
    setEditedMonitored(!!book.monitored)
    setEditedQualityProfileId(book.qualityProfileId?.toString() || '')
    setEditedMetadataProfileId(book.metadataProfileId?.toString() || '')
    const tags = Array.isArray(book.tags) ? book.tags : []
    setEditedTags(tags.join(', '))
    setIsEditDialogOpen(true)
  }

  const handleEditAuthorClick = (author: AuthorItem) => {
    setAuthorToEdit(author)
    setEditedMonitored(!!author.monitored)
    setEditedQualityProfileId(author.qualityProfileId?.toString() || '')
    setEditedMetadataProfileId(author.metadataProfileId?.toString() || '')
    const tags = Array.isArray(author.tags) ? author.tags : []
    setEditedTags(tags.join(', '))
    setIsEditDialogOpen(true)
  }

  const handleSaveBookEdit = async () => {
    if (bookToEdit && readarrEnabled) {
      const updatedBook: BookItem = {
        ...bookToEdit,
        monitored: editedMonitored,
        qualityProfileId: parseInt(editedQualityProfileId) || 1,
        metadataProfileId: parseInt(editedMetadataProfileId) || 1,
        tags: editedTags.split(',').map(tag => parseInt(tag.trim())).filter(tag => !isNaN(tag)),
      }
      
      try {
        if ('toggleBookMonitor' in actions.books && updatedBook.monitored !== bookToEdit.monitored) {
          await actions.books.toggleBookMonitor(bookToEdit.id)
        }
        // Note: Quality profile, metadata profile, and tags updates would need additional API methods
        console.log('Saving updated book:', updatedBook)
        setIsEditDialogOpen(false)
        setBookToEdit(null)
        // Refresh the book data
        fetch.books()
      } catch (error) {
        console.error('Failed to save book:', error)
      }
    }
  };

  const handleSaveAuthorEdit = async () => {
    if (authorToEdit && readarrEnabled) {
      const updatedAuthor: AuthorItem = {
        ...authorToEdit,
        monitored: editedMonitored,
        qualityProfileId: parseInt(editedQualityProfileId) || 1,
        metadataProfileId: parseInt(editedMetadataProfileId) || 1,
        tags: editedTags.split(',').map(tag => parseInt(tag.trim())).filter(tag => !isNaN(tag)),
      }
      
      try {
        if ('toggleAuthorMonitor' in actions.authors && updatedAuthor.monitored !== authorToEdit.monitored) {
          await actions.authors.toggleAuthorMonitor(authorToEdit.id)
        }
        // Note: Quality profile, metadata profile, and tags updates would need additional API methods
        console.log('Saving updated author:', updatedAuthor)
        setIsEditDialogOpen(false)
        setAuthorToEdit(null)
        // Refresh the author data
        fetch.authors()
      } catch (error) {
        console.error('Failed to save author:', error)
      }
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!readarrEnabled) return
    
    try {
      if ('deleteBook' in actions.books) {
        await actions.books.deleteBook(bookId)
        // Refresh the book data
        fetch.books()
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  };

  const handleDeleteAuthor = async (authorId: number) => {
    if (!readarrEnabled) return
    
    try {
      if ('deleteAuthor' in actions.authors) {
        await actions.authors.deleteAuthor(authorId)
        // Refresh the author data
        fetch.authors()
      }
    } catch (error) {
      console.error('Failed to delete author:', error)
    }
  };

  const handleSearchBook = async (bookId: number) => {
    if (!readarrEnabled) return
    
    try {
      if ('searchBook' in actions.books) {
        await actions.books.searchBook(bookId)
        // Refresh the activity data
        fetch.books()
      }
    } catch (error) {
      console.error('Failed to search book:', error)
    }
  };

  const handleSearchAuthor = async (authorId: number) => {
    if (!readarrEnabled) return
    
    try {
      if ('searchAuthor' in actions.authors) {
        await actions.authors.searchAuthor(authorId)
        // Refresh the activity data
        fetch.authors()
      }
    } catch (error) {
      console.error('Failed to search author:', error)
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloaded': return 'default'
      case 'missing': return 'destructive'
      case 'upcoming': return 'secondary'
      case 'announced': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Global Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{moduleName}</h2>
          <p className="text-muted-foreground">Book Collection Management</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await actions.refreshAll()
                fetch.books()
                fetch.authors()
              } catch (e) {
                console.error(e)
              }
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddBookDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Book
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddAuthorDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Author
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
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{effectiveBooks.length}</div>
            <p className="text-xs text-muted-foreground">
              {effectiveBooks.filter(b => b.statistics?.bookFileCount > 0).length} downloaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Authors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{effectiveAuthors.length}</div>
            <p className="text-xs text-muted-foreground">
              {effectiveAuthors.filter(a => a.monitored).length} monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Queue</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{Array.isArray(queue) ? queue.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {/* active count placeholder */}
              0 active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">
              {formatBytes(
                effectiveBooks.reduce((acc, book) => acc + (book.statistics?.sizeOnDisk || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* free space placeholder */}
              0 GB free
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v)} className="space-y-3">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-3">
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
                      placeholder="Search books..."
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
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="downloaded">Downloaded</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="announced">Announced</SelectItem>
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
                  <Button variant="outline" className="w-full h-9" onClick={() => setIsAddBookDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Book
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books List */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Book Library
              </CardTitle>
              <CardDescription>
                Manage your book collection
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Release Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book: BookItem) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.authorName}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(book.status || '') as any}>
                            {book.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{book.releaseDate ? new Date(book.releaseDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{formatBytes(book.statistics?.sizeOnDisk || 0)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleBookAction('toggle_monitor', book.id)}
                            >
                              {book.monitored ? (
                                <Bookmark className="h-4 w-4 text-green-500" />
                              ) : (
                                <BookmarkOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditBookClick(book)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSearchBook(book.id)}>
                                  <Search className="h-4 w-4 mr-2" />
                                  Search Book
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteBook(book.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Book
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authors Tab */}
        <TabsContent value="authors" className="space-y-3">
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
                      placeholder="Search authors..."
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
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                  <Button variant="outline" className="w-full h-9" onClick={() => setIsAddAuthorDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Author
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authors List */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Author Library
              </CardTitle>
              <CardDescription>
                Manage your author collection
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Books</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuthors.map((author: AuthorItem) => (
                      <TableRow key={author.id}>
                        <TableCell className="font-medium">{author.name}</TableCell>
                        <TableCell>{author.bookCount}</TableCell>
                        <TableCell>
                          <Badge variant={author.monitored ? 'default' : 'secondary'}>
                            {author.monitored ? 'Monitored' : 'Unmonitored'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatBytes(author.statistics?.sizeOnDisk || 0)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleAuthorAction('toggle_monitor', author.id)}
                            >
                              {author.monitored ? (
                                <Bookmark className="h-4 w-4 text-green-500" />
                              ) : (
                                <BookmarkOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditAuthorClick(author)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSearchAuthor(author.id)}>
                                  <Search className="h-4 w-4 mr-2" />
                                  Search Author
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteAuthor(author.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Author
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Queue
              </CardTitle>
              <CardDescription>
                Currently downloading books
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {Array.isArray(queue) && queue.length > 0 ? (
                  queue.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.author} • {item.quality}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{item.status}</span>
                            <span>•</span>
                            <span>{item.timeleft}</span>
                            <span>•</span>
                            <span>{item.progress}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {item.progress !== undefined && item.progress !== 100 && (
                        <div className="mt-2">
                          <Progress value={item.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No items in queue</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                History
              </CardTitle>
              <CardDescription>
                Recent download history
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {Array.isArray(history) && history.length > 0 ? (
                  history.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.author} • {item.quality}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{item.date ? new Date(item.date).toLocaleString() : '—'}</span>
                            <span>•</span>
                            <Badge variant={item.success ? 'default' : 'destructive'}>
                              {item.success ? 'Success' : 'Failed'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No history available</div>
                )}
              </div>
            </CardContent>
          </Card>
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
                <CardDescription>Current {moduleName} system information</CardDescription>
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
                <CardDescription>Health status of {moduleName} components</CardDescription>
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

            {/* Updates Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Updates
                </CardTitle>
                <CardDescription>Available updates for {moduleName}</CardDescription>
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
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <ModuleLogViewer moduleName={moduleName} logs={[]} />
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
              <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                /api/{moduleName.toLowerCase().replace(' ', '')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Book Dialog */}
      {bookToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Book: {bookToEdit.title}</DialogTitle>
              <DialogDescription>
                Make changes to the book settings here. Click save when you're done.
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
                <Select
                  value={editedQualityProfileId}
                  onValueChange={setEditedQualityProfileId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(qualityProfiles) && qualityProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metadataProfile" className="text-right">
                  Metadata Profile
                </Label>
                <Select
                  value={editedMetadataProfileId}
                  onValueChange={setEditedMetadataProfileId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(metadataProfiles) && metadataProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
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
              <Button type="submit" onClick={handleSaveBookEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Author Dialog */}
      {authorToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Author: {authorToEdit.name}</DialogTitle>
              <DialogDescription>
                Make changes to the author settings here. Click save when you're done.
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
                <Select
                  value={editedQualityProfileId}
                  onValueChange={setEditedQualityProfileId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(qualityProfiles) && qualityProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metadataProfile" className="text-right">
                  Metadata Profile
                </Label>
                <Select
                  value={editedMetadataProfileId}
                  onValueChange={setEditedMetadataProfileId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(metadataProfiles) && metadataProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
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
              <Button type="submit" onClick={handleSaveAuthorEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Book Dialog */}
      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Book</DialogTitle>
            <DialogDescription>Search and add a book to your library</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm">Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., The Great Gatsby"
                  value={addBookSearchTerm}
                  onChange={(e) => setAddBookSearchTerm(e.target.value)}
                  className="h-9"
                />
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => actions.lookupBook(addBookSearchTerm)}
                  disabled={!addBookSearchTerm.trim() || loading}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Lookup
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Results</Label>
              <div className="max-h-48 overflow-y-auto border rounded">
                {Array.isArray(actions.lookupResults?.books) && actions.lookupResults.books.length > 0 ? (
                  actions.lookupResults.books.map((i: any) => (
                    <div
                      key={i.id}
                      className={`px-2 py-1 text-sm cursor-pointer ${selectedBookId === i.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedBookId(i.id)}
                      role="button"
                    >
                      {i.title} {i.authorName ? `by ${i.authorName}` : ''}
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
                  value={addBookQualityProfileId}
                  onValueChange={(v) => setAddBookQualityProfileId(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(qualityProfiles) && qualityProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Metadata Profile</Label>
                <Select
                  value={addBookMetadataProfileId}
                  onValueChange={(v) => setAddBookMetadataProfileId(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(metadataProfiles) && metadataProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm">Root Folder</Label>
                <Select
                  value={addBookRootFolderId}
                  onValueChange={(v) => setAddBookRootFolderId(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(rootFolders) && rootFolders.map((folder: any) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Monitored</Label>
                <div className="flex items-center h-9">
                  <Switch checked={addBookMonitored} onCheckedChange={setAddBookMonitored} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                try {
                  const sel = (actions.lookupResults?.books || []).find((i: any) => i.id === selectedBookId) as any
                  if (!sel || !addBookQualityProfileId || !addBookMetadataProfileId || !addBookRootFolderId) return
                  await actions.books.addBook({
                    title: sel.title,
                    authorName: sel.authorName,
                    qualityProfileId: parseInt(addBookQualityProfileId),
                    metadataProfileId: parseInt(addBookMetadataProfileId),
                    rootFolderPath: addBookRootFolderId,
                    monitored: addBookMonitored,
                    tags: [],
                  } as any)
                  setIsAddBookDialogOpen(false)
                  setAddBookSearchTerm('')
                  setSelectedBookId(null)
                  setAddBookQualityProfileId('')
                  setAddBookMetadataProfileId('')
                  setAddBookRootFolderId('')
                  setAddBookMonitored(true)
                  fetch.books()
                } catch (e) {
                  console.error('Failed to add book', e)
                }
              }}
              disabled={!selectedBookId || !addBookQualityProfileId || !addBookMetadataProfileId || !addBookRootFolderId}
            >
              Add Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Author Dialog */}
      <Dialog open={isAddAuthorDialogOpen} onOpenChange={setIsAddAuthorDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Author</DialogTitle>
            <DialogDescription>Search and add an author to your library</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm">Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Stephen King"
                  value={addAuthorSearchTerm}
                  onChange={(e) => setAddAuthorSearchTerm(e.target.value)}
                  className="h-9"
                />
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => actions.lookupAuthor(addAuthorSearchTerm)}
                  disabled={!addAuthorSearchTerm.trim() || loading}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Lookup
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Results</Label>
              <div className="max-h-48 overflow-y-auto border rounded">
                {Array.isArray(actions.lookupResults?.authors) && actions.lookupResults.authors.length > 0 ? (
                  actions.lookupResults.authors.map((i: any) => (
                    <div
                      key={i.id}
                      className={`px-2 py-1 text-sm cursor-pointer ${selectedAuthorId === i.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedAuthorId(i.id)}
                      role="button"
                    >
                      {i.name} {i.bookCount ? `(${i.bookCount} books)` : ''}
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
                  value={addAuthorQualityProfileId}
                  onValueChange={(v) => setAddAuthorQualityProfileId(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(qualityProfiles) && qualityProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Metadata Profile</Label>
                <Select
                  value={addAuthorMetadataProfileId}
                  onValueChange={(v) => setAddAuthorMetadataProfileId(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(metadataProfiles) && metadataProfiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm">Root Folder</Label>
                <Select
                  value={addAuthorRootFolderId}
                  onValueChange={(v) => setAddAuthorRootFolderId(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(rootFolders) && rootFolders.map((folder: any) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Monitored</Label>
                <div className="flex items-center h-9">
                  <Switch checked={addAuthorMonitored} onCheckedChange={setAddAuthorMonitored} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                try {
                  const sel = (actions.lookupResults?.authors || []).find((i: any) => i.id === selectedAuthorId) as any
                  if (!sel || !addAuthorQualityProfileId || !addAuthorMetadataProfileId || !addAuthorRootFolderId) return
                  await actions.authors.addAuthor({
                    name: sel.name,
                    qualityProfileId: parseInt(addAuthorQualityProfileId),
                    metadataProfileId: parseInt(addAuthorMetadataProfileId),
                    rootFolderPath: addAuthorRootFolderId,
                    monitored: addAuthorMonitored,
                    tags: [],
                  } as any)
                  setIsAddAuthorDialogOpen(false)
                  setAddAuthorSearchTerm('')
                  setSelectedAuthorId(null)
                  setAddAuthorQualityProfileId('')
                  setAddAuthorMetadataProfileId('')
                  setAddAuthorRootFolderId('')
                  setAddAuthorMonitored(true)
                  fetch.authors()
                } catch (e) {
                  console.error('Failed to add author', e)
                }
              }}
              disabled={!selectedAuthorId || !addAuthorQualityProfileId || !addAuthorMetadataProfileId || !addAuthorRootFolderId}
            >
              Add Author
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}