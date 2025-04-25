
export interface Release {
  title: string;
  artist: string;
  cover_url: string;
  redirect_url: string | null;
  links_by_platform: {
    [key: string]: { url: string; }
  };
  description?: string | null;
  og_description?: string | null;
  upc?: string;
}
