require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Real candidate images provided by user
const candidateImages = {
  'Dr Lazarus Chakwera': 'https://mbc.mw/storage/2024/04/chakwera24-1-1-960x755.jpg?v=1714306953',
  'Prof. peter mutharika': 'https://times.mw/wp-content/uploads/2024/04/peter-mutharika.jpg',
  'Dr Jocyce Banda': 'https://www.globalthinkersforum.org/assets/images/common/Joyce_Banda.jpg',
  'Dr Dalitso Kabambe': 'https://www.yonecofm.com/wp-content/uploads/2025/06/Kabambe.jpg',
  'Atupele Muluzi': 'https://www.nyasatimes.com/wp-content/uploads/ATUPELE-MINISTER.jpg',
  'Dr Michael Usi': 'https://mbc.mw/storage/2024/06/michael-usi-860x756-1.jpg?v=1718907799'
};

async function updateCandidateImages() {
  try {
    console.log('🔄 Updating candidate images with real photos...');
    
    // Get all candidates
    const candidates = await prisma.candidate.findMany();
    console.log(`Found ${candidates.length} candidates`);
    
    const updates = [];
    
    for (const candidate of candidates) {
      console.log(`Processing: ${candidate.name} (ID: ${candidate.id})`);
      
      // Get the real image URL for this candidate
      const realImageUrl = candidateImages[candidate.name];
      
      if (!realImageUrl) {
        console.log(`⚠️  No real image found for ${candidate.name}, skipping...`);
        continue;
      }
      
      console.log(`Current image: ${candidate.image}`);
      console.log(`New real image: ${realImageUrl}`);
      
      const updated = await prisma.candidate.update({
        where: { id: candidate.id },
        data: { image: realImageUrl }
      });
      
      updates.push({
        id: candidate.id,
        name: candidate.name,
        oldImage: candidate.image,
        newImage: realImageUrl
      });
      
      console.log(`✅ Updated ${candidate.name} with real image: ${realImageUrl}`);
    }
    
    console.log('🎉 All candidate images updated with real photos!');
    console.log(`Updated ${updates.length} candidates:`);
    updates.forEach(update => {
      console.log(`  - ${update.name}: ${update.newImage}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating candidate images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateCandidateImages().catch(console.error); 