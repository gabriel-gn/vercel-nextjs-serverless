export interface YoutubePlaylist {
  kind: string
  etag: string
  nextPageToken: string
  items: Item[]
  pageInfo: PageInfo
}

export interface Item {
  kind: string
  etag: string
  id: string
  snippet: Snippet
  contentDetails: ContentDetails
}

export interface Snippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  playlistId: string
  position: number
  resourceId: ResourceId
  videoOwnerChannelTitle: string
  videoOwnerChannelId: string
}

export interface Thumbnails {
  default: Default
  medium: Medium
  high: High
  standard: Standard
  maxres: Maxres
}

export interface Default {
  url: string
  width: number
  height: number
}

export interface Medium {
  url: string
  width: number
  height: number
}

export interface High {
  url: string
  width: number
  height: number
}

export interface Standard {
  url: string
  width: number
  height: number
}

export interface Maxres {
  url: string
  width: number
  height: number
}

export interface ResourceId {
  kind: string
  videoId: string
}

export interface ContentDetails {
  videoId: string
  videoPublishedAt: string
}

export interface PageInfo {
  totalResults: number
  resultsPerPage: number
}
