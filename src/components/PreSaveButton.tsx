
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

    setIsLoading(false);
  };

  return (
    <Button 
      variant="outline"
      onClick={handlePreSave}
      disabled={isLoading}
      className="w-full mt-4 bg-[#1DB954] text-white hover:bg-[#1DB954]/90"
    >
      {isLoading ? 'Сохраняем...' : 'Сохранить в Spotify'}
      {presaveCount > 0 && (
        <span className="ml-2 text-sm text-white/80">
          ({presaveCount})
        </span>
      )}
    </Button>
  );
}
