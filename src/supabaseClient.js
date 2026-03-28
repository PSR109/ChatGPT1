import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmwxuzryztmauvvuyahj.supabase.co';
const supabaseKey = 'sb_publishable_H1jhMCqpTqxGotuaKA_Tag_n8RlKei0';

export const supabase = createClient(supabaseUrl, supabaseKey);
