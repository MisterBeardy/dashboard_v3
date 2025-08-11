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
    // Check if Radarr is configured
    const cfg = resolveServiceConfig('radarr')
    
    // Create OpenAPI 3.0 specification for Radarr
    const openapiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Radarr API',
        version: '4.0.1.6178',
        description: 'API for Radarr - PVR for Usenet and BitTorrent users',
        contact: {
          name: 'Radarr Team',
          url: 'https://radarr.video'
        },
        license: {
          name: 'GPL-3.0',
          url: 'https://www.gnu.org/licenses/gpl-3.0.txt'
        }
      },
      servers: [
        {
          url: '/api/radarr',
          description: 'Dashboard Radarr API Proxy'
        }
      ],
      paths: {
        '/movie': {
          get: {
            summary: 'Get all movies',
            description: 'Returns all movies in your collection',
            tags: ['Movies'],
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
                            description: 'Movie ID'
                          },
                          title: {
                            type: 'string',
                            description: 'Movie title'
                          },
                          sortTitle: {
                            type: 'string',
                            description: 'Sort title'
                          },
                          status: {
                            type: 'string',
                            description: 'Movie status',
                            enum: ['announced', 'inCinemas', 'released', 'deleted']
                          },
                          overview: {
                            type: 'string',
                            description: 'Movie overview'
                          },
                          studio: {
                            type: 'string',
                            description: 'Studio'
                          },
                          runtime: {
                            type: 'integer',
                            description: 'Runtime in minutes'
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
                          movieFile: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'integer'
                              },
                              movieId: {
                                type: 'integer'
                              },
                              relativePath: {
                                type: 'string'
                              },
                              path: {
                                type: 'string'
                              },
                              size: {
                                type: 'integer'
                              },
                              dateAdded: {
                                type: 'string',
                                format: 'date-time'
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
        '/movie/{id}': {
          get: {
            summary: 'Get movie by ID',
            description: 'Returns a single movie by ID',
            tags: ['Movies'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Movie ID',
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
                        // ... other movie properties
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Movie not found'
              }
            }
          }
        },
        '/movies': {
          get: {
            summary: 'Get all movies (alternative endpoint)',
            description: 'Returns all movies in your collection',
            tags: ['Movies'],
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
                          title: {
                            type: 'string'
                          },
                          // ... other movie properties
                        }
                      }
                    }
                  }
                }
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
                              movieId: {
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
                  enum: ['date', 'movieId']
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
                              movieId: {
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
        '/diskspace': {
          get: {
            summary: 'Get disk space',
            description: 'Returns disk space information',
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
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          path: {
                            type: 'string'
                          },
                          label: {
                            type: 'string'
                          },
                          freeSpace: {
                            type: 'integer'
                          },
                          totalSpace: {
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
        }
      },
      tags: [
        {
          name: 'Movies',
          description: 'Movie management'
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
          name: 'Profiles',
          description: 'Quality profiles'
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
      { error: 'Radarr is not configured' },
      { status: 400 }
    )
  }
}