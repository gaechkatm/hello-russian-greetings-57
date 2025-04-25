
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";

interface PreSaveButtonProps {
  upc: string;
}

export function PreSaveButton({ upc }: PreSaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [presaveCount, setPresaveCount] = useState<number>(0);

  useEffect(() => {
    // Get presave count when component loads
    const fetchPresaveCount = async () => {
      try {
        const { count, error } = await supabase
          .from('presaves')
          .select('*', { count: 'exact', head: true })
          .eq('upc', upc);
          
        if (error) throw error;
        if (count !== null) setPresaveCount(count);
      } catch (error) {
        console.error('Error fetching presave count:', error);
      }
    };
    
    if (upc) {
      fetchPresaveCount();
    }
  }, [upc]);

  const handlePreSave = async () => {
    setIsLoading(true);
    
    try {
      // Initialize Spotify OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'user-read-private user-follow-modify',
          redirectTo: `${window.location.origin}${window.location.pathname}`
        }
      });

      if (error) {
        console.error('Spotify auth error:', error);
        toast.error('Ошибка авторизации Spotify');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Произошла ошибка');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5" />
        <span className="text-sm text-muted-foreground">
          Пресейв {presaveCount > 0 && `(${presaveCount})`}
        </span>
      </div>
      <a onClick={handlePreSave} className="group">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="bg-secondary/50 hover:bg-secondary transition-all duration-300"
        >
          {isLoading ? '...' : <Bookmark className="w-4 h-4" />}
        </Button>
      </a>
    </div>
  );
}
