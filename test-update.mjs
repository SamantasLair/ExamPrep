import { createClient } from '@supabase/supabase-js';

const url = 'https://zypljreybjugmjckmkwk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cGxqcmV5Ymp1Z21qY2tta3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTYxODMsImV4cCI6MjA4ODA3MjE4M30.HYftQxk6wv_d2QmC9bht2dzr3JZ9xoJ99Ix4tmz3y7c';
const supabase = createClient(url, key);

async function testUpdate() {
  // Try to find a test first
  const { data: tests, error: fetchErr } = await supabase.from('tests').select('id, title').limit(1);
  if (fetchErr || !tests || tests.length === 0) {
    console.log('No tests found or error fetching:', fetchErr);
    return;
  }
  
  const testId = tests[0].id;
  const oldTitle = tests[0].title;
  console.log(`Found test: ${testId} - ${oldTitle}`);
  
  // Try update
  const newTitle = oldTitle + ' (edited)';
  console.log(`Attempting to update title to: ${newTitle}`);
  const { data: updateData, error: updateErr } = await supabase.from('tests').update({ title: newTitle }).eq('id', testId).select();
  
  console.log('Update Error:', updateErr);
  console.log('Update Returned Data:', updateData);
  
  // Re-fetch
  const { data: checkData } = await supabase.from('tests').select('title').eq('id', testId).single();
  console.log('Final Title currently in DB:', checkData.title);
  
  // Reset
  await supabase.from('tests').update({ title: oldTitle }).eq('id', testId);
}

testUpdate();
