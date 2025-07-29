import { createClient } from '@supabase/supabase-js'

// Dados de conexão com o seu projeto Supabase
const supabaseUrl = 'https://idyvhveasispvhpdpzvx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeXZodmVhc2lzcHZocGRwenZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODA5MTEsImV4cCI6MjA2Nzk1NjkxMX0.RLggabyuCaubwyLn15ucX3Tq3-TBJGnI5Iesi0M-ZuE'

// Cria e exporta o cliente Supabase para ser usado em toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey)