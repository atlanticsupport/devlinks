// Configuração do Supabase
const SUPABASE_URL = 'https://ylgokqpoakvqzfbeyimp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zPgfmPUyRVuN1_3D1cBzZg_G-iOtCgp';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
