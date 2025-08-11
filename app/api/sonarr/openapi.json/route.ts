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
    // Check if Sonarr is configured
    const cfg = resolveServiceConfig('sonarr')
    
    // Create OpenAPI 3.0 specification for Sonarr
    const openapiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Sonarr API',
        version: '3.0.0.4342',
        description: 'API for Sonarr - PVR for Usenet and BitTorrent users',
        contact: {
          name: 'Sonarr Team',
          url: 'https://sonarr.tv'
        },
        license: {
          name: 'GPL-3.0',
          url: 'https://www.gnu.org/licenses/gpl-3.0.txt'
        }
      },
      servers: [
        {
          url: '/api/sonarr',
          description: 'Dashboard Sonarr API Proxy'
        }
      ],
      paths: {
        '/series': {
          get: {
            summary: 'Get all series',
            description: 'Returns all series in your collection',
            tags: ['Series'],
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
                            description: 'Series ID'
                          },
                          title: {
                            type: 'string',
                            description: 'Series title'
                          },
                          sortTitle: {
                            type: 'string',
                            description: 'Sort title'
                          },
                          status: {
                            type: 'string',
                            description: 'Series status',
                            enum: ['continuing', 'ended', 'upcoming', 'deleted']
                          },
                          overview: {
                            type: 'string',
                            description: 'Series overview'
                          },
                          network: {
                            type: 'string',
                            description: 'Network'
                          },
                          airTime: {
                            type: 'string',
                            description: 'Air time'
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
                          seasons: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                seasonNumber: {
                                  type: 'integer'
                                },
                                monitored: {
                                  type: 'boolean'
                                },
                                statistics: {
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
          }
        },
        '/series/{id}': {
          get: {
            summary: 'Get series by ID',
            description: 'Returns a single series by ID',
            tags: ['Series'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Series ID',
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
                        // ... other series properties
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Series not found'
              }
            }
          }
        },
        '/calendar': {
          get: {
            summary: 'Get calendar',
            description: 'Returns upcoming episodes',
            tags: ['Calendar'],
            parameters: [
              {
                name: 'start',
                in: 'query',
                description: 'Start date',
                required: false,
                schema: {
                  type: 'string',
                  format: 'date'
                }
              },
              {
                name: 'end',
                in: 'query',
                description: 'End date',
                required: false,
                schema: {
                  type: 'string',
                  format: 'date'
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
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          seriesId: {
                            type: 'integer'
                          },
                          episodeId: {
                            type: 'integer'
                          },
                          title: {
                            type: 'string'
                          },
                          airDate: {
                            type: 'string',
                            format: 'date'
                          },
                          overview: {
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
                              seriesId: {
                                type: 'integer'
                              },
                              episodeId: {
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
                  enum: ['date', 'seriesId', 'episodeId']
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
                              seriesId: {
                                type: 'integer'
                              },
                              episodeId: {
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
        }
      },
      tags: [
        {
          name: 'Series',
          description: 'Series management'
        },
        {
          name: 'Calendar',
          description: 'Calendar operations'
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
      { error: 'Sonarr is not configured' },
      { status: 400 }
    )
  }
}