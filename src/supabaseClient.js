import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgvqhnfkiqkwyegtkrig.supabase.co'
const supabaseKey = 'sb_publishable_7ZJ_unYuwTMcEfWJ0wZmcA_5G_iHZm5'

export const supabase = createClient(supabaseUrl, supabaseKey)