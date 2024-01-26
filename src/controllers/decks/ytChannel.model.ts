import {UserDeck} from "@gabrielgn-test/runeterra-tools";

export interface YoutubeChannelInfo {
  kind: string
  etag: string
  id: string
  snippet: Snippet
  contentDetails: ContentDetails
}

export interface Snippet {
  title: string
  description: string
  customUrl: string
  publishedAt: string
  thumbnails: Thumbnails
  localized: Localized
}

export interface Thumbnails {
  default: ThumbnailProperties
  medium: ThumbnailProperties
  high: ThumbnailProperties
}

export interface ThumbnailProperties {
  url: string
  width: number
  height: number
}

export interface Localized {
  title: string
  description: string
}

export interface ContentDetails {
  relatedPlaylists: RelatedPlaylists
}

export interface RelatedPlaylists {
  likes: string
  uploads: string
}

export interface SocialMediaSource {
  title: string;
  thumbnail: string;
  origin?: string;
}

export interface SocialMediaDecks {
  source: SocialMediaSource;
  decks: UserDeck[]
}