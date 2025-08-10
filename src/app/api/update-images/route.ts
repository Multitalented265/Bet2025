import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    
    
    // Get all candidates
    const candidates = await prisma.candidate.findMany();
    
    
    const updates = [];
    
         // Real candidate images mapping
     const candidateImages: Record<string, string> = {
       'Dr Lazarus Chakwera': 'https://mbc.mw/storage/2024/04/chakwera24-1-1-960x755.jpg?v=1714306953',
       'Prof. peter mutharika': 'https://times.mw/wp-content/uploads/2024/04/peter-mutharika.jpg',
       'Dr Jocyce Banda': 'https://www.globalthinkersforum.org/assets/images/common/Joyce_Banda.jpg',
       'Dr Dalitso Kabambe': 'https://www.yonecofm.com/wp-content/uploads/2025/06/Kabambe.jpg',
       'Atupele Muluzi': 'https://www.nyasatimes.com/wp-content/uploads/ATUPELE-MINISTER.jpg',
       'Dr Michael Usi': 'https://mbc.mw/storage/2024/06/michael-usi-860x756-1.jpg?v=1718907799'
     };
     
     for (const candidate of candidates) {
       
       
       // Get the real image URL for this candidate
       const imageUrl = candidateImages[candidate.name] || `https://picsum.photos/400/400?random=${candidate.id}`;
      
      const updated = await prisma.candidate.update({
        where: { id: candidate.id },
        data: { image: imageUrl }
      });
      
      updates.push({
        id: candidate.id,
        name: candidate.name,
        oldImage: candidate.image,
        newImage: imageUrl
      });
      
      
    }
    
    
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} candidates`,
      updates
    });
    
  } catch (error) {
    console.error('❌ Error updating candidate images:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 