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
    // Check if Prowlarr is configured
    const cfg = resolveServiceConfig('prowlarr')
    
    // Create OpenAPI 3.0 specification for Prowlarr
    const openapiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Prowlarr API',
        version: '1.0.0.2286',
        description: 'API for Prowlarr - Indexer manager for Usenet and BitTorrent users',
        contact: {
          name: 'Prowlarr Team',
          url: 'https://prowlarr.com'
        },
        license: {
          name: 'GPL-3.0',
          url: 'https://www.gnu.org/licenses/gpl-3.0.txt'
        }
      },
      servers: [
        {
          url: '/api/prowlarr',
          description: 'Dashboard Prowlarr API Proxy'
        }
      ],
      paths: {
        '/indexer': {
          get: {
            summary: 'Get all indexers',
            description: 'Returns all configured indexers',
            tags: ['Indexers'],
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
                            description: 'Indexer ID'
                          },
                          name: {
                            type: 'string',
                            description: 'Indexer name'
                          },
                          implementation: {
                            type: 'string',
                            description: 'Implementation'
                          },
                          implementationName: {
                            type: 'string',
                            description: 'Implementation name'
                          },
                          configContract: {
                            type: 'string',
                            description: 'Config contract'
                          },
                          enable: {
                            type: 'boolean',
                            description: 'Enable indexer'
                          },
                          priority: {
                            type: 'integer',
                            description: 'Priority'
                          },
                          protocol: {
                            type: 'string',
                            description: 'Protocol',
                            enum: ['usenet', 'torrent']
                          },
                          tags: {
                            type: 'array',
                            items: {
                              type: 'integer'
                            }
                          },
                          fields: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: {
                                  type: 'string'
                                },
                                value: {
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
          }
        },
        '/indexer/{id}': {
          get: {
            summary: 'Get indexer by ID',
            description: 'Returns a single indexer by ID',
            tags: ['Indexers'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Indexer ID',
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
                        name: {
                          type: 'string'
                        },
                        // ... other indexer properties
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Indexer not found'
              }
            }
          }
        },
        '/applications': {
          get: {
            summary: 'Get all applications',
            description: 'Returns all configured applications',
            tags: ['Applications'],
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
                            description: 'Application ID'
                          },
                          name: {
                            type: 'string',
                            description: 'Application name'
                          },
                          implementation: {
                            type: 'string',
                            description: 'Implementation'
                          },
                          implementationName: {
                            type: 'string',
                            description: 'Implementation name'
                          },
                          configContract: {
                            type: 'string',
                            description: 'Config contract'
                          },
                          enable: {
                            type: 'boolean',
                            description: 'Enable application'
                          },
                          syncLevel: {
                            type: 'string',
                            description: 'Sync level'
                          },
                          tags: {
                            type: 'array',
                            items: {
                              type: 'integer'
                            }
                          },
                          fields: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: {
                                  type: 'string'
                                },
                                value: {
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
          }
        },
        '/downloadclient': {
          get: {
            summary: 'Get all download clients',
            description: 'Returns all configured download clients',
            tags: ['Download Clients'],
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
                            description: 'Download client ID'
                          },
                          name: {
                            type: 'string',
                            description: 'Download client name'
                          },
                          implementation: {
                            type: 'string',
                            description: 'Implementation'
                          },
                          implementationName: {
                            type: 'string',
                            description: 'Implementation name'
                          },
                          configContract: {
                            type: 'string',
                            description: 'Config contract'
                          },
                          enable: {
                            type: 'boolean',
                            description: 'Enable download client'
                          },
                          protocol: {
                            type: 'string',
                            description: 'Protocol',
                            enum: ['usenet', 'torrent']
                          },
                          priority: {
                            type: 'integer',
                            description: 'Priority'
                          },
                          tags: {
                            type: 'array',
                            items: {
                              type: 'integer'
                            }
                          },
                          fields: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: {
                                  type: 'string'
                                },
                                value: {
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
        '/health': {
          get: {
            summary: 'Get health status',
            description: 'Returns health status information',
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
                          source: {
                            type: 'string'
                          },
                          type: {
                            type: 'string'
                          },
                          message: {
                            type: 'string'
                          },
                          wikiUrl: {
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
        '/command': {
          get: {
            summary: 'Get commands',
            description: 'Returns all available commands',
            tags: ['Commands'],
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
                          commandName: {
                            type: 'string'
                          },
                          message: {
                            type: 'string'
                          },
                          priority: {
                            type: 'string'
                          },
                          status: {
                            type: 'string'
                          },
                          started: {
                            type: 'string',
                            format: 'date-time'
                          },
                          end: {
                            type: 'string',
                            format: 'date-time'
                          },
                          duration: {
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
      },
      tags: [
        {
          name: 'Indexers',
          description: 'Indexer management'
        },
        {
          name: 'Applications',
          description: 'Application management'
        },
        {
          name: 'Download Clients',
          description: 'Download client management'
        },
        {
          name: 'System',
          description: 'System information'
        },
        {
          name: 'Commands',
          description: 'Command management'
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
      { error: 'Prowlarr is not configured' },
      { status: 400 }
    )
  }
}