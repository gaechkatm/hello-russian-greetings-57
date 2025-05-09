
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Share, Play } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { PreSaveButton } from "@/components/PreSaveButton";
import type { Release as ReleaseType } from "@/types/release";

// Import platform logos
import SpotifyLogo from "/public/lovable-uploads/77e9518d-1cd7-4236-9010-d7387562db4f.png";
import AppleMusicLogo from "/public/lovable-uploads/ad5fe374-e379-4ec0-a036-e8d79b2492d1.png";
import YoutubeMusicLogo from "/public/lovable-uploads/06bc136f-5266-4959-be9f-5057f8f3b613.png";
import SoundCloudLogo from "/public/lovable-uploads/585f5bc7-7945-4c00-9aa7-c771b7ab2d8d.png";
import YandexLogo from "/public/lovable-uploads/fb0190c9-a778-48b7-a175-1fc791cb16a8.png";
import VKMusicLogo from "/public/lovable-uploads/c2513543-25d6-4eea-b7c6-c4e530cfd711.png";

const ALLOWED_PLATFORMS = {
  spotify: {
    name: "Spotify",
    icon: <img src={SpotifyLogo} alt="Spotify" className="w-5 h-5" />,
  },
  appleMusic: {
    name: "Apple Music",
    icon: <img src={AppleMusicLogo} alt="Apple Music" className="w-5 h-5" />,
  },
  youtubeMusic: {
    name: "YouTube Music",
    icon: <img src={YoutubeMusicLogo} alt="YouTube Music" className="w-5 h-5" />,
  },
  yandex: {
    name: "Яндекс Музыка",
    icon: <img src={YandexLogo} alt="Yandex Music" className="w-5 h-5" />,
  },
  soundcloud: {
    name: "SoundCloud",
    icon: <img src={SoundCloudLogo} alt="SoundCloud" className="w-5 h-5" />,
  },
  vk: {
    name: "VK Музыка",
    icon: <img src={VKMusicLogo} alt="VK Music" className="w-5 h-5" />,
  }
};

export default function Release() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState<ReleaseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelease() {
      if (!slug) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('releases')
          .select()
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Error:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          if (data.redirect_url) {
            const redirectUrl = data.redirect_url.startsWith('http') 
              ? data.redirect_url 
              : `https://${data.redirect_url}`;
              
            window.location.href = redirectUrl;
            return;
          }

          const links = typeof data.links_by_platform === 'string' 
            ? JSON.parse(data.links_by_platform) 
            : data.links_by_platform;

          // Cast the data to include the upc field since we know it exists in our database
          // but TypeScript doesn't recognize it from the type definition
          const releaseData = data as any;
          
          setRelease({
            title: data.title,
            artist: data.artist || "Unknown Artist",
            cover_url: data.cover_url,
            redirect_url: data.redirect_url,
            links_by_platform: links || {},
            description: data.description,
            og_description: data.og_description,
            upc: releaseData.upc
          });
        }
      } catch (error) {
        console.error('Error fetching release:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelease();
  }, [slug]);

  const getDescription = () => {
    if (!release) return "Слушайте новые релизы на любимых музыкальных платформах";
    
    // Use custom OG description if available
    if (release.og_description) return release.og_description;
    
    // Use regular description if available
    if (release.description) return release.description;
    
    // Default description
    return `Слушай релиз "${release.title}" от ${release.artist} на любимой платформе`;
  };

  const handleShare = async () => {
    if (!release) return;
    
    const currentUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${release.artist} - ${release.title}`,
          text: getDescription(),
          url: currentUrl,
        });
      } catch (error) {
        console.error('Ошибка при шаринге:', error);
        toast.error("Не удалось поделиться");
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Ссылка скопирована в буфер обмена");
      } catch {
        toast.error("Не удалось скопировать ссылку");
      }
    }
  };

  const showPresaveButton = (release: ReleaseType) => {
    // Show presave button only if spotify link is not available
    return !release.links_by_platform?.spotify;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-background text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-background text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Релиз не найден</p>
        </div>
      </div>
    );
  }

  const filteredLinks = Object.entries(release.links_by_platform || {})
    .filter(([platform]) => platform in ALLOWED_PLATFORMS)
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <Helmet>
        <title>{`${release.artist} - ${release.title}`}</title>
        <meta name="description" content={getDescription()} />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content={`${release.artist} - ${release.title}`} />
        <meta property="og:description" content={getDescription()} />
        <meta property="og:image" content={release.cover_url} />
        <meta property="og:type" content="music.song" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${release.artist} - ${release.title}`} />
        <meta name="twitter:description" content={getDescription()} />
        <meta name="twitter:image" content={release.cover_url} />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center w-full bg-background text-foreground p-4">
        <div className="w-full max-w-md space-y-8 glass p-8 rounded-xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="relative group perspective">
              <img 
                src={release.cover_url} 
                alt={release.title}
                className="w-64 h-64 rounded-xl shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-[2deg]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl" />
            </div>
            
            <div className="mt-6 text-center space-y-2">
              <h1 className="text-2xl font-medium text-gradient">
                {release.title}
              </h1>
              <p className="text-lg text-muted-foreground">{release.artist}</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="mt-4 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300" 
              onClick={handleShare}
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4 w-full">
            {release.upc && showPresaveButton(release) && (
              <PreSaveButton upc={release.upc} />
            )}
            
            {filteredLinks.map(([platform, linkData]) => {
              if (!linkData || typeof linkData !== 'object' || !('url' in linkData)) {
                return null; // Skip invalid link data
              }
              
              const platformConfig = ALLOWED_PLATFORMS[platform as keyof typeof ALLOWED_PLATFORMS];
              if (!platformConfig) return null;
              
              return (
                <div 
                  key={platform}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    {platformConfig.icon}
                    <span className="text-sm text-muted-foreground">
                      {platformConfig.name}
                    </span>
                  </div>
                  <a 
                    href={linkData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-secondary/50 hover:bg-secondary transition-all duration-300"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
