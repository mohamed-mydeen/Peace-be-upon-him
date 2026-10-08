// ============================================
// DHIKR DATA
// Sourced adhkar with counts and references
// ============================================

export const DHIKR_SESSIONS = [
  { id: 'after-prayer', name: 'After Prayer', tamil: 'தொழுகைக்குப் பின்' },
  { id: 'morning', name: 'Morning Adhkar', tamil: 'காலை அத்கார்' },
  { id: 'evening', name: 'Evening Adhkar', tamil: 'மாலை அத்கார்' },
  { id: 'general', name: 'General Dhikr', tamil: 'பொது திக்ர்' },
];

export const DHIKR_LIST = [
  // AFTER PRAYER
  {
    id: 'subhanallah',
    session: 'after-prayer',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    meaning_tamil: 'அல்லாஹ் தூய்மையானவன்',
    meaning_english: 'Glory be to Allah',
    target: 33,
    reference: 'Sahih Muslim 597',
    note: 'Say SubhanAllah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times after each prayer.',
  },
  {
    id: 'alhamdulillah',
    session: 'after-prayer',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaning_tamil: 'எல்லாப் புகழும் அல்லாஹ்வுக்கே',
    meaning_english: 'All praise is due to Allah',
    target: 33,
    reference: 'Sahih Muslim 597',
  },
  {
    id: 'allahu-akbar',
    session: 'after-prayer',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning_tamil: 'அல்லாஹ் மிகவும் பெரியவன்',
    meaning_english: 'Allah is the Greatest',
    target: 33,
    reference: 'Sahih Muslim 597',
  },
  {
    id: 'la-ilaha-illallah',
    session: 'after-prayer',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallah wahdahu la sharika lahu, lahul mulku wa lahul hamd, wa huwa 'ala kulli shay'in qadir",
    meaning_tamil: 'அல்லாஹ்வைத் தவிர வணக்கத்திற்குரியவன் யாருமில்லை, அவன் ஒருவனே, அவனுக்கு இணையில்லை, அவனுக்கே ஆட்சி, அவனுக்கே புகழ், அவன் அனைத்திற்கும் ஆற்றலுடையவன்.',
    meaning_english: 'None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.',
    target: 1,
    reference: 'Sahih Muslim 597',
    note: 'Say once after completing 99 counts (SubhanAllah + Alhamdulillah + Allahu Akbar).',
  },

  // MORNING
  {
    id: 'morning-subhanallah',
    session: 'morning',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdih',
    meaning_tamil: 'அல்லாஹ் தூய்மையானவன், அவனுக்கே புகழ்',
    meaning_english: 'Glory be to Allah and His is the praise',
    target: 100,
    reference: 'Sahih al-Bukhari 6405, Sahih Muslim 2692',
    note: "The Prophet ﷺ said: 'Whoever says SubhanAllahi wa bihamdih 100 times in the morning and 100 times in the evening, no one will come on the Day of Resurrection with anything better.' (Muslim 2692)",
  },
  {
    id: 'morning-istighfar',
    session: 'morning',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: "Astaghfirullaha wa atubu ilayh",
    meaning_tamil: 'அல்லாஹ்விடம் மன்னிப்பு கோருகிறேன், அவனிடம் தவ்பா செய்கிறேன்.',
    meaning_english: 'I seek the forgiveness of Allah and I repent to Him.',
    target: 100,
    reference: 'Sahih al-Bukhari 6307, Sahih Muslim 2702',
    note: "The Prophet ﷺ said: 'By Allah, I seek Allah's forgiveness and turn to Him in repentance more than seventy times a day.' (Bukhari 6307)",
  },

  // GENERAL
  {
    id: 'salawat',
    session: 'general',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    transliteration: "Allahumma salli 'ala Muhammad",
    meaning_tamil: 'அல்லாஹ்வே! முஹம்மது ﷺ அவர்களுக்கு சலவாத் அருள்வாயாக.',
    meaning_english: 'O Allah, send blessings upon Muhammad.',
    target: 10,
    reference: 'Sahih Muslim 408',
    note: "The Prophet ﷺ said: 'Whoever sends one blessing upon me, Allah will send ten blessings upon him.' (Muslim 408)",
  },
  {
    id: 'istighfar',
    session: 'general',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: "Astaghfirullah",
    meaning_tamil: 'அல்லாஹ்விடம் மன்னிப்பு கோருகிறேன்',
    meaning_english: 'I seek the forgiveness of Allah',
    target: 70,
    reference: 'Sahih al-Bukhari 6307',
  },
  {
    id: 'la-hawla',
    session: 'general',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    meaning_tamil: 'அல்லாஹ்வின் துணையன்றி சக்தியோ வலிமையோ இல்லை.',
    meaning_english: 'There is no power or strength except with Allah.',
    target: 33,
    reference: 'Sahih al-Bukhari 4205',
    note: "It is a treasure from the treasures of Paradise. (Bukhari 4205)",
  },
];

export function getDhikrBySession(sessionId) {
  if (!sessionId || sessionId === 'all') return DHIKR_LIST;
  return DHIKR_LIST.filter(d => d.session === sessionId);
}
