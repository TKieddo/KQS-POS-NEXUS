// Test script to debug backup functionality
// Run this in the browser console on the data management page

console.log('=== Backup Test Script ===');

// Test 1: Check if storage buckets exist
async function testStorageBuckets() {
  console.log('Testing storage buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return;
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name) || []);
    
    const backupsExists = buckets?.some(b => b.name === 'backups');
    const exportsExists = buckets?.some(b => b.name === 'exports');
    
    console.log('Backups bucket exists:', backupsExists);
    console.log('Exports bucket exists:', exportsExists);
    
    return { backupsExists, exportsExists };
  } catch (error) {
    console.error('Error testing storage buckets:', error);
  }
}

// Test 2: Try to create a backup
async function testBackup() {
  console.log('Testing backup creation...');
  
  try {
    // Import the backup function
    const { createBackup } = await import('./src/lib/data-management-service.ts');
    
    const result = await createBackup({ include_files: true });
    console.log('Backup result:', result);
    
    return result;
  } catch (error) {
    console.error('Error testing backup:', error);
  }
}

// Test 3: Check backup history
async function testBackupHistory() {
  console.log('Testing backup history...');
  
  try {
    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching backup history:', error);
      return;
    }
    
    console.log('Recent backups:', data);
    return data;
  } catch (error) {
    console.error('Error testing backup history:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Running all backup tests...');
  
  await testStorageBuckets();
  await testBackupHistory();
  // Uncomment the line below to test backup creation
  // await testBackup();
  
  console.log('Tests completed. Check console for results.');
}

// Make functions available globally
window.testBackup = testBackup;
window.testStorageBuckets = testStorageBuckets;
window.testBackupHistory = testBackupHistory;
window.runAllTests = runAllTests;

console.log('Test functions available:');
console.log('- testStorageBuckets()');
console.log('- testBackupHistory()');
console.log('- testBackup()');
console.log('- runAllTests()'); 