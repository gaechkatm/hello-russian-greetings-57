// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pjkqcvuqzceepanbzpyx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqa3FjdnVxemNlZXBhbmJ6cHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwOTM1OTMsImV4cCI6MjA2MDY2OTU5M30.9slK47vM-6vmKLMDBSg0E-NDMoNochv0wK2b_SVa0Cs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);