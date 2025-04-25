
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface PreSaveButtonProps {
  upc: string;
}

export function PreSaveButton({ upc }: PreSaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [presaveCount, setPresaveCount] = useState<number>(0);

  const handlePreSave = async () => {
    setIsLoading(true);
    
    // Initialize Spotify OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-read-private',
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
      className="w-full mt-4"
    >
      {isLoading ? 'Сохраняем...' : 'Сохранить в Spotify'}
      {presaveCount > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          ({presaveCount})
        </span>
      )}
    </Button>
  );
}
