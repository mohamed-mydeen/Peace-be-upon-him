import fs from 'fs';
import { DUAS, DUA_CATEGORIES } from './src/services/dua.js';
import { DHIKR_LIST, DHIKR_SESSIONS } from './src/services/dhikr.js';
import { AFTER_SALAH_DHIKR } from './src/services/after-salah.js';

fs.mkdirSync('./public/api', { recursive: true });
fs.writeFileSync('./public/api/duas.json', JSON.stringify({ categories: DUA_CATEGORIES, duas: DUAS }, null, 2));
fs.writeFileSync('./public/api/dhikr.json', JSON.stringify({ sessions: DHIKR_SESSIONS, dhikrList: DHIKR_LIST }, null, 2));

// check if AFTER_SALAH_CATEGORIES exists, else just dhikr
let afterSalahData = { dhikrList: AFTER_SALAH_DHIKR };
try {
  const afterSalahMod = await import('./src/services/after-salah.js');
  if (afterSalahMod.AFTER_SALAH_CATEGORIES) {
    afterSalahData.categories = afterSalahMod.AFTER_SALAH_CATEGORIES;
  }
} catch(e) {}
fs.writeFileSync('./public/api/after-salah.json', JSON.stringify(afterSalahData, null, 2));

console.log("JSON generated");
