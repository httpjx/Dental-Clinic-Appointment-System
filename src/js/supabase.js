import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtepuhxingnljasydcyt.supabase.co';
const supabaseKey = 'sb_publishable_vUuM3zOysfU_xATj_2WRfQ_tQWZTs2L';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);