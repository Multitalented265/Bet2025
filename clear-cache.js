const fs = require('fs');
const path = require('path');

async function clearCache() {
  try {
    console.log('🧹 Clearing Next.js cache...');
    
    // Clear .next directory
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('✅ Cleared .next directory');
    }

    // Clear node_modules/.cache if it exists
    const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('✅ Cleared node_modules/.cache');
    }

    console.log('\n🎉 Cache cleared successfully!');
    console.log('💡 Please restart your application with: npm run dev');

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
}

clearCache(); 