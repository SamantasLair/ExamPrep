import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local if not already in process.env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env.local or process.env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const STUDENTS_SEED = [
  {
    id: 'SMA-001',
    name: 'Budi Santoso',
    birthday: '2008-04-15',
    avatar_url: null,
    created_at: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'SMA-002',
    name: 'Siti Rahma',
    birthday: '2008-09-22',
    avatar_url: null,
    created_at: '2026-01-11T09:30:00.000Z'
  },
  {
    id: 'SMA-003',
    name: 'Fajar Pratama',
    birthday: '2007-12-05',
    avatar_url: null,
    created_at: '2026-01-12T10:15:00.000Z'
  },
  {
    id: 'SMA-004',
    name: 'Aisha Putri',
    birthday: '2008-07-18',
    avatar_url: null,
    created_at: '2026-01-14T11:20:00.000Z'
  }
];

async function runSeed() {
  console.log('Initiating remote Supabase seeding...');
  
  // Seed Students
  console.log('Seeding student profiles...');
  const { error: studentErr } = await supabase
    .from('students')
    .upsert(STUDENTS_SEED, { onConflict: 'id' });

  if (studentErr) {
    console.warn('Note: students table seeding error (table may not exist or permissions restricted):', studentErr.message);
  } else {
    console.log('Successfully seeded 4 authentic student profiles.');
  }

  console.log('Seeding finished.');
}

runSeed().catch((err) => {
  console.error('Seeding encountered an unhandled exception:', err);
  process.exit(1);
});
