const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vdrfuhzfywpakxozohld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcmZ1aHpmeXdwYWt4b3pvaGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTgxNDQsImV4cCI6MjA3NzEzNDE0NH0.1e6iAULSMGlU8m4K9eMEcIS8zOBUy9n8urJKoViNf1g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTaxRulesTable() {
  try {
    console.log('Creating tax_rules table using direct SQL...');
    
    // First, let's try to create a simple tax_rules table
    const { data, error } = await supabase
      .from('tax_rules')
      .insert({
        name: 'Test Rule',
        description: 'Test Description',
        tax_rate: 15.00,
        dining_type: 'all',
        priority: 1,
        is_active: true
      });
    
    if (error) {
      console.error('Error inserting test data:', error);
      console.log('\nThe tax_rules table does not exist. Please create it manually in Supabase SQL Editor.');
      console.log('Go to: https://supabase.com/dashboard/project/vdrfuhzfywpakxozohld/sql');
      console.log('\nCopy and paste the contents of create-tax-tables.sql file');
      return;
    }
    
    console.log('✓ tax_rules table exists and is working');
    
    // Clean up test data
    if (data && data.length > 0) {
      await supabase
        .from('tax_rules')
        .delete()
        .eq('name', 'Test Rule');
    }
    
  } catch (err) {
    console.error('Error:', err);
    console.log('\nPlease create the tax_rules table manually in Supabase SQL Editor.');
    console.log('Go to: https://supabase.com/dashboard/project/vdrfuhzfywpakxozohld/sql');
    console.log('\nCopy and paste the contents of create-tax-tables.sql file');
  }
}

createTaxRulesTable();