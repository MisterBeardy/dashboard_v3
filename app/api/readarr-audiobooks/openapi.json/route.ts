import { NextResponse } from 'next/server'
import { resolveServiceConfig } from '@/lib/config/service-config'

function withCors(resp: NextResponse): NextResponse {
  resp.headers.set('access-control-allow-origin', '*')
  resp.headers.set(
    'access-control-expose-headers',
    [
      'x-upstream-url-initial',
      'x-upstream-url-final',
      'x-upstream-method',
      'content-type',
    ].join(', ')
  )
  return resp
}

export async function GET() {
  try {
    // Check if Readarr_audiobooks is configured
    const cfg = resolveServiceConfig('readarr_audiobooks')
    
    // Create OpenAPI 3.0 specification for Readarr_audiobooks
    const openapiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Readarr Audiobooks API',
        version: '0.1.1.1371',
        description: 'API for Readarr Audiobooks - Audiobook collection manager for Usenet and BitTorrent users',
        contact: {
          name: 'Readarr Team',
          url: 'https://readarr.com'
        },
        license: {
          name: 'GPL-3.0',
          url: 'https://www.gnu.org/licenses/gpl-3.0.txt'
        }
      },
      servers: [
        {
          url: '/api/readarr-audiobooks',
          description: 'Dashboard Readarr Audiobooks API Proxy'
        }
      ],
      paths: {
        '/author': {
          get: {
            summary: 'Get all authors',
            description: 'Returns all authors in your collection',
            tags: ['Authors'],
            parameters: [
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            description: 'Author ID'
                          },
                          authorName: {
                            type: 'string',
                            description: 'Author name'
                          },
                          sortName: {
                            type: 'string',
                            description: 'Sort name'
                          },
                          status: {
                            type: 'string',
                            description: 'Author status',
                            enum: ['continuing', 'ended', 'upcoming', 'deleted']
                          },
                          overview: {
                            type: 'string',
                            description: 'Author overview'
                          },
                          disambiguation: {
                            type: 'string',
                            description: 'Disambiguation'
                          },
                          images: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                coverType: {
                                  type: 'string'
                                },
                                url: {
                                  type: 'string'
                                }
                              }
                            }
                          },
                          links: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                url: {
                                  type: 'string'
                                },
                                name: {
                                  type: 'string'
                                }
                              }
                            }
                          },
                          metadataProfileId: {
                            type: 'integer',
                            description: 'Metadata profile ID'
                          },
                          qualityProfileId: {
                            type: 'integer',
                            description: 'Quality profile ID'
                          },
                          monitored: {
                            type: 'boolean',
                            description: 'Monitor author'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/author/{id}': {
          get: {
            summary: 'Get author by ID',
            description: 'Returns a single author by ID',
            tags: ['Authors'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Author ID',
                schema: {
                  type: 'integer'
                }
              },
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer'
                        },
                        authorName: {
                          type: 'string'
                        },
                        // ... other author properties
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Author not found'
              }
            }
          }
        },
        '/book': {
          get: {
            summary: 'Get all audiobooks',
            description: 'Returns all audiobooks in your collection',
            tags: ['Audiobooks'],
            parameters: [
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            description: 'Audiobook ID'
                          },
                          title: {
                            type: 'string',
                            description: 'Audiobook title'
                          },
                          titleSlug: {
                            type: 'string',
                            description: 'Title slug'
                          },
                          releaseDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Release date'
                          },
                          duration: {
                            type: 'integer',
                            description: 'Duration in minutes'
                          },
                          overview: {
                            type: 'string',
                            description: 'Audiobook overview'
                          },
                          authorId: {
                            type: 'integer',
                            description: 'Author ID'
                          },
                          authorTitle: {
                            type: 'string',
                            description: 'Author title'
                          },
                          images: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                coverType: {
                                  type: 'string'
                                },
                                url: {
                                  type: 'string'
                                }
                              }
                            }
                          },
                          links: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                url: {
                                  type: 'string'
                                },
                                name: {
                                  type: 'string'
                                }
                              }
                            }
                          },
                          ratings: {
                            type: 'object',
                            properties: {
                              votes: {
                                type: 'integer'
                              },
                              value: {
                                type: 'number'
                              }
                            }
                          },
                          statistics: {
                            type: 'object',
                            properties: {
                              bookCount: {
                                type: 'integer'
                              },
                              bookFileCount: {
                                type: 'integer'
                              },
                              totalBookCount: {
                                type: 'integer'
                              },
                              sizeOnDisk: {
                                type: 'integer'
                              },
                              percentOfBooks: {
                                type: 'number'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/book/{id}': {
          get: {
            summary: 'Get audiobook by ID',
            description: 'Returns a single audiobook by ID',
            tags: ['Audiobooks'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Audiobook ID',
                schema: {
                  type: 'integer'
                }
              },
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer'
                        },
                        title: {
                          type: 'string'
                        },
                        // ... other audiobook properties
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Audiobook not found'
              }
            }
          }
        },
        '/queue': {
          get: {
            summary: 'Get download queue',
            description: 'Returns current download queue',
            tags: ['Queue'],
            parameters: [
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        page: {
                          type: 'integer'
                        },
                        pageSize: {
                          type: 'integer'
                        },
                        totalRecords: {
                          type: 'integer'
                        },
                        records: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer'
                              },
                              authorId: {
                                type: 'integer'
                              },
                              bookId: {
                                type: 'integer'
                              },
                              title: {
                                type: 'string'
                              },
                              size: {
                                type: 'integer'
                              },
                              sizeleft: {
                                type: 'integer'
                              },
                              status: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/system/status': {
          get: {
            summary: 'Get system status',
            description: 'Returns system status information',
            tags: ['System'],
            parameters: [
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        version: {
                          type: 'string'
                        },
                        buildTime: {
                          type: 'string',
                          format: 'date-time'
                        },
                        isDebug: {
                          type: 'boolean'
                        },
                        isProduction: {
                          type: 'boolean'
                        },
                        isAdmin: {
                          type: 'boolean'
                        },
                        isUser: {
                          type: 'boolean'
                        },
                        startTime: {
                          type: 'string',
                          format: 'date-time'
                        },
                        packageVersion: {
                          type: 'string'
                        },
                        packageAuthor: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/history': {
          get: {
            summary: 'Get download history',
            description: 'Returns download history',
            tags: ['History'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                description: 'Page number',
                required: false,
                schema: {
                  type: 'integer',
                  default: 1
                }
              },
              {
                name: 'pageSize',
                in: 'query',
                description: 'Page size',
                required: false,
                schema: {
                  type: 'integer',
                  default: 10
                }
              },
              {
                name: 'sortKey',
                in: 'query',
                description: 'Sort key',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['date', 'authorId', 'bookId']
                }
              },
              {
                name: 'sortDir',
                in: 'query',
                description: 'Sort direction',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc'
                }
              },
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        page: {
                          type: 'integer'
                        },
                        pageSize: {
                          type: 'integer'
                        },
                        totalRecords: {
                          type: 'integer'
                        },
                        records: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              authorId: {
                                type: 'integer'
                              },
                              bookId: {
                                type: 'integer'
                              },
                              sourceTitle: {
                                type: 'string'
                              },
                              quality: {
                                type: 'string'
                              },
                              date: {
                                type: 'string',
                                format: 'date-time'
                              },
                              eventType: {
                                type: 'string'
                              },
                              data: {
                                type: 'object'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/wanted/missing': {
          get: {
            summary: 'Get missing audiobooks',
            description: 'Returns all missing audiobooks',
            tags: ['Wanted'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                description: 'Page number',
                required: false,
                schema: {
                  type: 'integer',
                  default: 1
                }
              },
              {
                name: 'pageSize',
                in: 'query',
                description: 'Page size',
                required: false,
                schema: {
                  type: 'integer',
                  default: 10
                }
              },
              {
                name: 'sortKey',
                in: 'query',
                description: 'Sort key',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['title', 'author', 'releaseDate']
                }
              },
              {
                name: 'sortDir',
                in: 'query',
                description: 'Sort direction',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc'
                }
              },
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        page: {
                          type: 'integer'
                        },
                        pageSize: {
                          type: 'integer'
                        },
                        totalRecords: {
                          type: 'integer'
                        },
                        records: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer'
                              },
                              title: {
                                type: 'string'
                              },
                              authorTitle: {
                                type: 'string'
                              },
                              releaseDate: {
                                type: 'string',
                                format: 'date'
                              },
                              statistics: {
                                type: 'object',
                                properties: {
                                  bookCount: {
                                    type: 'integer'
                                  },
                                  bookFileCount: {
                                    type: 'integer'
                                  },
                                  totalBookCount: {
                                    type: 'integer'
                                  },
                                  percentOfBooks: {
                                    type: 'number'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/qualityprofile': {
          get: {
            summary: 'Get quality profiles',
            description: 'Returns all quality profiles',
            tags: ['Profiles'],
            parameters: [
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer'
                          },
                          name: {
                            type: 'string'
                          },
                          upgradeAllowed: {
                            type: 'boolean'
                          },
                          cutoff: {
                            type: 'integer'
                          },
                          items: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                quality: {
                                  type: 'object',
                                  properties: {
                                    id: {
                                      type: 'integer'
                                    },
                                    name: {
                                      type: 'string'
                                    },
                                    source: {
                                      type: 'string'
                                    },
                                    resolution: {
                                      type: 'integer'
                                    }
                                  }
                                },
                                allowed: {
                                  type: 'boolean'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/metadataprofile': {
          get: {
            summary: 'Get metadata profiles',
            description: 'Returns all metadata profiles',
            tags: ['Profiles'],
            parameters: [
              {
                name: 'apikey',
                in: 'query',
                description: 'API key',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer'
                          },
                          name: {
                            type: 'string'
                          },
                          primaryAlbumTypes: {
                            type: 'array',
                            items: {
                              type: 'integer'
                            }
                          },
                          secondaryAlbumTypes: {
                            type: 'array',
                            items: {
                              type: 'integer'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      tags: [
        {
          name: 'Authors',
          description: 'Author management'
        },
        {
          name: 'Audiobooks',
          description: 'Audiobook management'
        },
        {
          name: 'Queue',
          description: 'Download queue'
        },
        {
          name: 'System',
          description: 'System information'
        },
        {
          name: 'History',
          description: 'Download history'
        },
        {
          name: 'Wanted',
          description: 'Wanted items'
        },
        {
          name: 'Profiles',
          description: 'Quality and metadata profiles'
        }
      ]
    }

    const response = NextResponse.json(openapiSpec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

    return withCors(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Readarr_audiobooks is not configured' },
      { status: 400 }
    )
  }
}