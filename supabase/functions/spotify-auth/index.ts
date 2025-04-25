
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getSpotifyAccessToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

async function getSpotifyUserProfile(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Spotify user profile');
  }
  
  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { upc } = await req.json();
    
    if (!upc) {
      throw new Error('UPC is required');
    }

    // Get user's Spotify access token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Spotify access token is required');
    }

    const spotifyToken = authHeader.replace('Bearer ', '');
    
    try {
      // Get user's Spotify profile
      const profile = await getSpotifyUserProfile(spotifyToken);
      
      // Store presave in database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: insertError } = await supabase
        .from('presaves')
        .insert({
          upc,
          spotify_user_id: profile.id
        });

      if (insertError) {
        // If error is unique violation, user has already presaved
        if (insertError.code === '23505') {
          return new Response(
            JSON.stringify({ message: 'Already presaved' }),
            { 
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        throw insertError;
      }

      return new Response(
        JSON.stringify({ message: 'Presave successful' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Spotify API error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid Spotify token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
  }
});
