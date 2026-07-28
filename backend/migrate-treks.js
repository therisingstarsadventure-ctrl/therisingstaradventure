import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Tw53dtUjHyNG@ep-long-shadow-adjveiti-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function migrate() {
  try {
    console.log('Reading js/data.js...');
    const dataPath = path.resolve(__dirname, '../js/data.js');
    let content = fs.readFileSync(dataPath, 'utf8');
    
    // Replace const TREKS_DATA with global assignment
    content = content.replace('const TREKS_DATA =', 'global.TREKS_DATA =');
    eval(content);

    const TREKS_DATA = global.TREKS_DATA;
    console.log(`Found ${TREKS_DATA.length} treks in static data.`);

    let count = 0;
    for (const trek of TREKS_DATA) {
      const exists = await prisma.trek.findUnique({ where: { id: trek.id } });
      
      const payload = {
        id: trek.id,
        title: trek.name,
        location: trek.zoneLabel || trek.zone,
        price: parseFloat(trek.price.replace(/[^0-9.-]+/g, "")), // "₹1,499" -> 1499
        days: trek.duration,
        description: trek.longDescription || trek.description,
        images: JSON.stringify(trek.gallery || []),
        zone: trek.zone,
        difficulty: trek.difficulty,
        duration: trek.duration,
        elevation: trek.elevation || 'N/A',
        groupSize: trek.groupSize || 'N/A',
        bestSeason: trek.bestSeason || 'N/A',
        meetingPoint: trek.meetingPoint || 'N/A',
        inclusions: JSON.stringify(trek.inclusions || []),
        exclusions: JSON.stringify(trek.exclusions || []),
        timeline: JSON.stringify(trek.timeline || []),
      };

      if (exists) {
        console.log(`Trek ${trek.id} exists. Updating...`);
        await prisma.trek.update({
          where: { id: trek.id },
          data: payload
        });
      } else {
        console.log(`Creating trek ${trek.id}...`);
        await prisma.trek.create({
          data: payload
        });
        count++;
      }
    }

    console.log(`Migration complete! Inserted ${count} new treks.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
