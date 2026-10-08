export const LESSON_SUBJECTS = [
  { id: 'aqidah', title: 'Aqidah', tamil: 'அகீதா', icon: '☝️', description: 'Belief and the foundations of faith' },
  { id: 'fiqh', title: 'Fiqh', tamil: 'ஃபிக்ஹ்', icon: '📖', description: 'Worship and everyday Islamic practice' },
  { id: 'seerah', title: 'Seerah', tamil: 'சீரா', icon: '🌙', description: 'Learn about the life of Prophet Muhammad ﷺ' },
  { id: 'akhlaq', title: 'Akhlaq', tamil: 'அக்லாக்', icon: '💚', description: 'Character, manners, and how we treat others' },
];

export const LESSONS = [
  {
    id: 'tawheed',
    subject: 'aqidah',
    title: 'Knowing Allah: Tawheed',
    tamil: 'அல்லாஹ்வை அறிதல்: தவ்ஹீத்',
    sections: [
      {
        title: 'What Tawheed means',
        titleTamil: 'தவ்ஹீத் என்பதன் பொருள்',
        english: 'Tawheed is to affirm that Allah alone is the Creator and Lord, and that He alone deserves every act of worship. It is the central message shared by all prophets. The Qur’an teaches that Allah is One, eternal, independent of creation, and unlike anything created.',
        tamil: 'அல்லாஹ் மட்டுமே படைப்பவன், பரிபாலிப்பவன் என்றும், அனைத்து வணக்கங்களுக்கும் அவன் மட்டுமே உரியவன் என்றும் உறுதியாக நம்புவதே தவ்ஹீத். எல்லா நபிமார்களும் எடுத்துரைத்த அடிப்படைச் செய்தி இதுவாகும். அல்லாஹ் ஒருவன், என்றும் நிலைத்தவன், படைப்புகளின் தேவையற்றவன், படைப்புகளைப் போன்றவன் அல்ல என்று குர்ஆன் கற்பிக்கிறது.',
      },
      {
        title: 'Worship Allah alone',
        titleTamil: 'அல்லாஹ்வை மட்டுமே வணங்குதல்',
        english: 'Prayer, supplication, trust in the unseen, vows, and sacrificial worship are acts to be directed to Allah alone. A Muslim asks Allah for help while also using lawful means and seeking help from people in matters they are able to do. Reliance on Allah and taking practical steps belong together.',
        tamil: 'தொழுகை, துஆ, மறைவானவற்றில் நம்பிக்கை, நேர்ச்சை, வணக்கத்திற்கான பலியிடுதல் ஆகியவை அல்லாஹ்வுக்கே உரிய வணக்கங்கள். அல்லாஹ்விடம் உதவி கேட்பதுடன், அனுமதிக்கப்பட்ட வழிமுறைகளையும் பயன்படுத்தி, ஒருவர் செய்யக்கூடிய காரியங்களில் அவர்களிடமும் உதவி நாடலாம். அல்லாஹ்வின் மீது நம்பிக்கை வைப்பதும் நடைமுறை முயற்சி செய்வதும் ஒன்றுக்கொன்று முரணானவை அல்ல.',
      },
      {
        title: 'How Tawheed shapes daily life',
        titleTamil: 'தினசரி வாழ்வில் தவ்ஹீத்',
        english: 'Tawheed gives worship its purpose and reminds a person that blessings and outcomes are ultimately from Allah. It encourages sincere worship, gratitude, courage, and freedom from treating created things as divine. Learning Allah’s names and attributes should be based on the Qur’an and authentic Sunnah, without comparing Allah to creation or claiming knowledge beyond revelation.',
        tamil: 'வணக்கத்திற்கு நோக்கத்தைத் தவ்ஹீத் அளிக்கிறது. அருள்களும் இறுதி முடிவுகளும் அல்லாஹ்விடமிருந்தே வருகின்றன என்பதை இது நினைவூட்டுகிறது. உளத்தூய்மையுடன் வணங்கவும், நன்றி செலுத்தவும், தைரியமாக இருக்கவும், படைக்கப்பட்டவற்றை இறைவனாகக் கருதாமல் இருக்கவும் இது ஊக்குவிக்கிறது. அல்லாஹ்வின் பெயர்களையும் பண்புகளையும் குர்ஆன் மற்றும் ஆதாரப்பூர்வமான ஸுன்னாவின் அடிப்படையில் கற்க வேண்டும்; அவனைப் படைப்புகளுடன் ஒப்பிடவோ, ஆதாரமற்ற விஷயங்களைக் கூறவோ கூடாது.',
      },
    ],
    references: ['Quran 112:1-4', 'Quran 16:36', 'Quran 42:11'],
  },
  {
    id: 'pillars-of-faith',
    subject: 'aqidah',
    title: 'The Six Pillars of Faith',
    tamil: 'ஈமானின் ஆறு அம்சங்கள்',
    sections: [
      {
        title: 'The Hadith of Jibril',
        titleTamil: 'ஜிப்ரீல் ஹதீஸ்',
        english: 'In the well-known Hadith of Jibril, the angel asked the Prophet ﷺ about faith. He ﷺ explained that faith includes belief in Allah, His angels, His revealed books, His messengers, the Last Day, and divine decree—its good and its difficult parts. These are connected beliefs, not separate competing choices.',
        tamil: 'பிரபலமான ஜிப்ரீல் ஹதீஸில், ஜிப்ரீல் வானவர் நபி ﷺ அவர்களிடம் ஈமானைப் பற்றிக் கேட்டார். அல்லாஹ், அவனுடைய வானவர்கள், அருளப்பட்ட வேதங்கள், தூதர்கள், இறுதி நாள், நன்மை மற்றும் சோதனை உட்பட விதி ஆகியவற்றை நம்புவதே ஈமான் என்று நபி ﷺ விளக்கினார்கள். இவை ஒன்றுடன் ஒன்று தொடர்புடைய நம்பிக்கைகள்.',
      },
      {
        title: 'What each pillar teaches',
        titleTamil: 'ஒவ்வொரு அம்சமும் கற்பிப்பது',
        english: 'Belief in Allah means worshipping Him and affirming His perfection. Angels are honored servants who obey Allah. Allah sent revelation through His books and guided humanity through messengers. The Last Day teaches accountability and resurrection. Divine decree reminds Muslims that Allah’s knowledge and will encompass all things, while people remain responsible for the choices they make.',
        tamil: 'அல்லாஹ்வை நம்புதல் என்பது அவனை வணங்கி, அவனுடைய முழுமையை உறுதிப்படுத்துதல். வானவர்கள் அல்லாஹ்வுக்குக் கீழ்ப்படியும் கண்ணியமான அடியார்கள். வேதங்கள் மூலம் அல்லாஹ் வெளிப்பாட்டை அருளி, தூதர்கள் மூலம் மனிதர்களுக்கு வழிகாட்டினான். இறுதி நாள் மறுமையையும் பொறுப்புக் கணக்கையும் நினைவூட்டுகிறது. அல்லாஹ்வின் அறிவும் நாட்டமும் அனைத்தையும் சூழ்ந்துள்ளன; அதே நேரத்தில் மனிதர்கள் தங்கள் தேர்வுகளுக்குப் பொறுப்பானவர்கள் என்பதை விதி நம்பிக்கை நினைவூட்டுகிறது.',
      },
      {
        title: 'Faith in practice',
        titleTamil: 'நடைமுறையில் ஈமான்',
        english: 'These beliefs should nurture worship, hope, patience, humility, and accountability. When something good happens, a believer thanks Allah; during hardship, they seek His help and respond through permissible means. Faith is learned from revelation and reliable teachers, and questions about its detailed theological discussions should be approached carefully.',
        tamil: 'இந்த நம்பிக்கைகள் வணக்கம், நம்பிக்கை, பொறுமை, பணிவு, பொறுப்புணர்வு ஆகியவற்றை வளர்க்க வேண்டும். நன்மை கிடைக்கும்போது அல்லாஹ்வுக்கு நன்றி செலுத்த வேண்டும்; சோதனையில் அவனிடம் உதவி கேட்டு, அனுமதிக்கப்பட்ட வழிகளில் செயல்பட வேண்டும். ஈமானை வெளிப்பாட்டின் அடிப்படையிலும் நம்பகமான ஆசிரியர்களிடமும் கற்க வேண்டும்; ஆழமான இறையியல் விவாதங்களை கவனமாக அணுக வேண்டும்.',
      },
    ],
    references: ['Sahih Muslim 8 (Hadith of Jibril)', 'Quran 2:285'],
  },
  {
    id: 'what-is-fiqh',
    subject: 'fiqh',
    title: 'What Is Fiqh?',
    tamil: 'ஃபிக்ஹ் என்றால் என்ன?',
    sections: [
      {
        title: 'Meaning and purpose',
        titleTamil: 'பொருளும் நோக்கமும்',
        english: 'Fiqh is the scholarly understanding of practical Islamic guidance from the Qur’an and Sunnah. It covers worship—such as purification, prayer, fasting, charity, and pilgrimage—as well as family and social dealings, business, and personal conduct. Its purpose is to help people worship Allah and deal justly with one another.',
        tamil: 'குர்ஆன் மற்றும் ஸுன்னாவின் அடிப்படையில் நடைமுறை மார்க்க வழிகாட்டுதலை அறிஞர்கள் புரிந்துகொள்வதே ஃபிக்ஹ். தூய்மை, தொழுகை, நோன்பு, ஸகாத், ஹஜ் போன்ற வணக்கங்களும் குடும்பம், சமூக உறவுகள், வணிகம், தனிப்பட்ட நடத்தை போன்றவையும் இதில் அடங்கும். அல்லாஹ்வை வணங்கவும் மக்களிடம் நீதியுடன் நடந்துகொள்ளவும் வழிகாட்டுவது இதன் நோக்கம்.',
      },
      {
        title: 'Evidence and scholarship',
        titleTamil: 'ஆதாரங்களும் அறிஞர்களும்',
        english: 'The Qur’an and the authentic Sunnah are the primary sources. Qualified scholars study these texts in their language and context, examine how reports relate to one another, and apply recognized principles to new situations. A short online lesson cannot replace that training or provide a personal ruling.',
        tamil: 'குர்ஆனும் ஆதாரப்பூர்வமான ஸுன்னாவும் முதன்மையான ஆதாரங்கள். தகுதியுள்ள அறிஞர்கள் மூலமொழி, சூழல், தொடர்புடைய அறிவிப்புகள், அங்கீகரிக்கப்பட்ட சட்டக் கோட்பாடுகள் ஆகியவற்றைக் கற்று புதிய சூழல்களுக்கும் வழிகாட்டுகிறார்கள். இணையத்தில் உள்ள ஒரு சிறிய பாடம் அந்தப் பயிற்சிக்கோ தனிப்பட்ட மார்க்கத் தீர்ப்புக்கோ மாற்றாகாது.',
      },
      {
        title: 'Differences and learning responsibly',
        titleTamil: 'கருத்து வேறுபாடுகளும் பொறுப்பான கற்றலும்',
        english: 'Muslim scholars may reach different conclusions on some detailed questions because they assess evidence and legal principles differently. Such recognized differences should be handled with respect, not mockery or accusations. Learn the basics from reliable teachers, ask for evidence respectfully, and consult a qualified scholar for personal circumstances.',
        tamil: 'ஆதாரங்களையும் சட்டக் கோட்பாடுகளையும் மதிப்பிடும் முறைகளில் வேறுபாடு இருப்பதால், சில நுணுக்கமான கேள்விகளில் முஸ்லிம் அறிஞர்கள் மாறுபட்ட முடிவுகளுக்கு வரலாம். அங்கீகரிக்கப்பட்ட இத்தகைய கருத்து வேறுபாடுகளை கேலி செய்யாமல், குற்றம் சாட்டாமல் மரியாதையுடன் அணுக வேண்டும். நம்பகமான ஆசிரியர்களிடம் அடிப்படைகளைக் கற்று, ஆதாரத்தை மரியாதையுடன் கேட்டு, தனிப்பட்ட சூழலுக்கு தகுதியுள்ள அறிஞரிடம் ஆலோசனை பெறுங்கள்.',
      },
    ],
    references: ['Quran 4:59', 'Quran 9:122', 'Quran 16:43'],
  },
  {
    id: 'purification',
    subject: 'fiqh',
    title: 'Purification Before Prayer',
    tamil: 'தொழுகைக்கு முன் தூய்மை',
    sections: [
      {
        title: 'Why purification matters',
        titleTamil: 'தூய்மை ஏன் முக்கியம்?',
        english: 'Prayer is approached with physical cleanliness and the ritual purification required by a person’s circumstances. The Qur’an gives the main actions of wudu: washing the face and arms, wiping the head, and washing the feet. The Prophet ﷺ taught the practical details through his example.',
        tamil: 'தொழுகைக்குத் தேவையான உடல் தூய்மையுடனும், ஒருவரின் நிலைக்கு ஏற்ப மார்க்கத் தூய்மையுடனும் தயாராக வேண்டும். முகம் மற்றும் கைகளைக் கழுவுதல், தலையைத் தடவுதல், கால்களைக் கழுவுதல் ஆகிய வுழூவின் முக்கியச் செயல்களை குர்ஆன் குறிப்பிடுகிறது. நபி ﷺ அவர்கள் தமது நடைமுறையின் மூலம் அதன் விவரங்களைக் கற்பித்தார்கள்.',
      },
      {
        title: 'A general outline of wudu',
        titleTamil: 'வுழூவின் பொதுவான முறை',
        english: 'Begin with the intention in the heart and say “Bismillah.” Wash the hands, rinse the mouth and nose, wash the face, wash the arms including the elbows, wipe the head and ears, and wash the feet including the ankles. Do each action calmly and ensure water reaches the areas being washed. The exact order and some details should be learned from a trusted teacher according to the school you follow.',
        tamil: 'உள்ளத்தில் நிய்யத் செய்து “பிஸ்மில்லாஹ்” என்று தொடங்குங்கள். கைகளைக் கழுவி, வாய் மற்றும் மூக்கைச் சுத்தம் செய்து, முகத்தைக் கழுவி, முழங்கைகள் உட்பட கைகளைக் கழுவி, தலையையும் காதுகளையும் தடவி, கணுக்கால்கள் உட்பட கால்களைக் கழுவுங்கள். அவசரப்படாமல், கழுவ வேண்டிய பகுதிகளுக்குத் தண்ணீர் சென்றதை உறுதிசெய்யுங்கள். வரிசை மற்றும் சில விவரங்களை நீங்கள் பின்பற்றும் மத்ஹப்/ஆசிரியரிடம் கற்றுக்கொள்ளுங்கள்.',
      },
      {
        title: 'Keep it balanced',
        titleTamil: 'சமநிலையுடன் கடைப்பிடித்தல்',
        english: 'Use water without waste and do not let doubts turn purification into hardship. Learn what actually invalidates wudu from reliable instruction; do not assume every uncertainty or ordinary event breaks it. When water cannot be used or would cause harm, Islamic law includes alternatives such as tayammum under its conditions—ask a scholar how those apply to your situation.',
        tamil: 'தண்ணீரை வீணாக்காமல் பயன்படுத்துங்கள்; சந்தேகங்கள் தூய்மையைச் சிரமமாக மாற்ற அனுமதிக்காதீர்கள். நம்பகமான வழிகாட்டுதலின் மூலம் வுழூவை உண்மையில் முறிக்கும் செயல்களைக் கற்றுக்கொள்ளுங்கள்; ஒவ்வொரு சந்தேகமும் அல்லது சாதாரண நிகழ்வும் வுழூவை முறிக்கும் என்று எண்ண வேண்டாம். தண்ணீரைப் பயன்படுத்த முடியாதபோது அல்லது தீங்கு ஏற்படும் சூழலில், நிபந்தனைகளுடன் தயம்மும் போன்ற மாற்று வழிகளை இஸ்லாமிய சட்டம் வழங்குகிறது; உங்கள் நிலைக்கு அவை எவ்வாறு பொருந்தும் என்பதை அறிஞரிடம் கேளுங்கள்.',
      },
    ],
    references: ['Quran 5:6', 'Sahih al-Bukhari 159'],
  },
  {
    id: 'mercy',
    subject: 'seerah',
    title: 'The Prophet ﷺ Was Sent as a Mercy',
    tamil: 'அருளாக அனுப்பப்பட்ட நபி ﷺ',
    sections: [
      {
        title: 'The message of mercy',
        titleTamil: 'அருளின் செய்தி',
        english: 'The Qur’an describes Prophet Muhammad ﷺ as a mercy to all worlds. His mission called people to worship Allah, leave injustice, and live with compassion and accountability. Mercy was not limited to kind words: it appeared in teaching, patience, fairness, and concern for people’s guidance.',
        tamil: 'நபி முஹம்மது ﷺ அவர்கள் அகிலத்தாருக்கு அருளாக அனுப்பப்பட்டதாக குர்ஆன் கூறுகிறது. அல்லாஹ்வை வணங்கவும், அநீதியை விட்டு விலகவும், கருணையுடனும் பொறுப்புணர்வுடனும் வாழவும் அவர்களின் தூதுச் செய்தி அழைத்தது. கருணை என்பது இனிய சொற்களுடன் மட்டும் முடிவடையவில்லை; கற்பித்தல், பொறுமை, நீதி, மக்களின் நேர்வழி குறித்த அக்கறை ஆகியவற்றிலும் அது வெளிப்பட்டது.',
      },
      {
        title: 'Mercy in his conduct',
        titleTamil: 'அவர்களின் நடத்தையில் கருணை',
        english: 'The Prophet ﷺ taught gently, cared for the vulnerable, honored family ties, and encouraged kindness to neighbors. His example joined mercy with truth and justice: being kind does not mean approving wrongdoing, and correcting someone should be done with wisdom and fairness.',
        tamil: 'நபி ﷺ அவர்கள் மென்மையாகக் கற்பித்து, பலவீனமானவர்களிடம் அக்கறை கொண்டு, குடும்ப உறவுகளை மதித்து, அண்டை வீட்டாரிடம் நன்மை செய்ய ஊக்குவித்தார்கள். அவர்களின் முன்மாதிரி கருணையையும் உண்மையையும் நீதியையும் இணைத்தது: கருணை காட்டுவது தவறை ஏற்றுக்கொள்வதல்ல; ஒருவரைத் திருத்தும்போதும் ஞானத்துடனும் நீதியுடனும் நடக்க வேண்டும்.',
      },
      {
        title: 'What we can learn',
        titleTamil: 'நாம் கற்றுக்கொள்ள வேண்டியது',
        english: 'Study Seerah through reliable sources and reflect on how revelation shaped the Prophet’s choices. Practice mercy in the home, patience when teaching, honesty in disagreements, and care for people in difficulty. Avoid sharing popular stories about the Seerah unless their sources have been checked.',
        tamil: 'நம்பகமான ஆதாரங்களின் மூலம் சீராவைக் கற்று, வெளிப்பாடு நபி ﷺ அவர்களின் முடிவுகளை எவ்வாறு வழிநடத்தியது என்று சிந்தியுங்கள். வீட்டில் கருணை, கற்பிக்கும்போது பொறுமை, கருத்து வேறுபாட்டில் நேர்மை, சிரமத்தில் இருப்பவர்களிடம் அக்கறை ஆகியவற்றைப் பழகுங்கள். ஆதாரம் சரிபார்க்கப்படாத பிரபலக் கதைகளை சீரா நிகழ்வுகளாகப் பகிர்வதைத் தவிருங்கள்.',
      },
    ],
    references: ['Quran 21:107', 'Quran 9:128'],
  },
  {
    id: 'prophetic-example',
    subject: 'seerah',
    title: 'Following the Prophetic Example',
    tamil: 'நபிவழியைப் பின்பற்றுதல்',
    sections: [
      {
        title: 'The Prophet ﷺ as an example',
        titleTamil: 'நபி ﷺ அவர்கள் முன்மாதிரி',
        english: 'The Qur’an presents the Messenger of Allah ﷺ as an excellent example for those who hope in Allah and the Last Day. His Sunnah includes his teachings, actions, approvals, and descriptions as transmitted through reliable reports. It helps Muslims understand how Qur’anic guidance was lived.',
        tamil: 'அல்லாஹ்வையும் இறுதி நாளையும் எதிர்பார்த்து, அல்லாஹ்வை அதிகம் நினைவுகூர்பவர்களுக்கு அல்லாஹ்வின் தூதர் ﷺ அழகிய முன்மாதிரி என்று குர்ஆன் கூறுகிறது. நம்பகமான அறிவிப்புகள் மூலம் கிடைக்கும் அவர்களின் போதனைகள், செயல்கள், அங்கீகாரங்கள், பண்புகள் ஆகியவை ஸுன்னாவில் அடங்கும். குர்ஆனிய வழிகாட்டுதல் வாழ்க்கையில் எவ்வாறு நடைமுறைப்படுத்தப்பட்டது என்பதை இது காட்டுகிறது.',
      },
      {
        title: 'Learn before you imitate',
        titleTamil: 'பின்பற்றுவதற்கு முன் கற்றுக்கொள்ளுங்கள்',
        english: 'A report should be checked for authenticity and understood in context before it is used as proof. Some Prophetic actions were specific to him or connected to a particular circumstance; scholars explain which teachings are general guidance. Learn from recognized Hadith works and qualified teachers rather than isolated quotations.',
        tamil: 'ஒரு அறிவிப்பை ஆதாரமாகப் பயன்படுத்துவதற்கு முன் அதன் நம்பகத்தன்மையையும் சூழலையும் சரிபார்க்க வேண்டும். சில நபிவழிச் செயல்கள் நபி ﷺ அவர்களுக்கே உரியதாகவோ குறிப்பிட்ட சூழலுடன் தொடர்புடையதாகவோ இருக்கலாம்; பொதுவான வழிகாட்டுதல்கள் எவை என்பதை அறிஞர்கள் விளக்குகிறார்கள். தனித்த மேற்கோள்களை மட்டும் நம்பாமல், அங்கீகரிக்கப்பட்ட ஹதீஸ் நூல்களிலும் தகுதியுள்ள ஆசிரியர்களிடமும் கற்றுக்கொள்ளுங்கள்.',
      },
      {
        title: 'Make it part of everyday life',
        titleTamil: 'அன்றாட வாழ்வில் நடைமுறைப்படுத்துதல்',
        english: 'Following the Prophet ﷺ includes sincerity in worship, keeping promises, speaking truthfully, showing patience, and treating people with mercy. Start with well-established practices you can maintain, learn their evidence, and avoid judging others over secondary matters where scholars differ.',
        tamil: 'நபி ﷺ அவர்களைப் பின்பற்றுவதில் வணக்கத்தில் உளத்தூய்மை, வாக்குறுதியைக் காப்பது, உண்மை பேசுவது, பொறுமை காட்டுவது, மக்களிடம் கருணையுடன் நடப்பது ஆகியவை அடங்கும். தொடர்ந்து கடைப்பிடிக்கக்கூடிய நன்கு உறுதிப்படுத்தப்பட்ட வழிமுறைகளில் தொடங்கி, அவற்றின் ஆதாரத்தைக் கற்றுக்கொள்ளுங்கள். அறிஞர்கள் கருத்து வேறுபடும் துணை விஷயங்களில் பிறரைத் தீர்ப்பிடுவதைத் தவிருங்கள்.',
      },
    ],
    references: ['Quran 33:21', 'Quran 59:7'],
  },
  {
    id: 'good-character',
    subject: 'akhlaq',
    title: 'Good Character and Kindness',
    tamil: 'நற்பண்பும் அன்பான நடத்தையும்',
    sections: [
      {
        title: 'Character is part of faith',
        titleTamil: 'ஈமானின் ஒரு பகுதியாக நற்பண்பு',
        english: 'The Qur’an commands justice, excellence, and generosity. Good character is not only friendliness; it includes fulfilling people’s rights, being honest, keeping trusts, controlling anger, and avoiding harm. Worship should encourage a person to act more fairly and compassionately.',
        tamil: 'நீதி, நன்மை செய்தல், உறவினர்களுக்கு வழங்குதல் ஆகியவற்றை குர்ஆன் கட்டளையிடுகிறது. நற்பண்பு என்பது இனிமையாகப் பழகுவது மட்டும் அல்ல; மக்களின் உரிமைகளை நிறைவேற்றுதல், நேர்மை, அமானிதத்தைக் காப்பது, கோபத்தைக் கட்டுப்படுத்துதல், தீங்கு செய்யாமல் இருப்பது ஆகியவையும் இதில் அடங்கும். வணக்கம் ஒருவரை மேலும் நீதியுடனும் கருணையுடனும் நடக்க ஊக்குவிக்க வேண்டும்.',
      },
      {
        title: 'Kindness at home and in society',
        titleTamil: 'வீட்டிலும் சமூகத்திலும் அன்பு',
        english: 'Begin with those closest to you: speak respectfully to parents and family, fulfill responsibilities, and apologize when you have caused harm. Extend kindness to neighbors, guests, workers, and people in need. Kindness should be joined with justice: do not use politeness as an excuse to ignore another person’s rights.',
        tamil: 'உங்களுக்கு நெருக்கமானவர்களிடமிருந்து தொடங்குங்கள்: பெற்றோர் மற்றும் குடும்பத்தினரிடம் மரியாதையுடன் பேசுங்கள், பொறுப்புகளை நிறைவேற்றுங்கள், பிறருக்குத் தீங்கு செய்தால் மன்னிப்புக் கேளுங்கள். அண்டை வீட்டார், விருந்தினர், பணியாளர்கள், தேவையுள்ளோர் ஆகியோரிடமும் அன்பை விரிவுபடுத்துங்கள். அன்புடன் நீதியும் இருக்க வேண்டும்; இனிமையாகப் பேசுவதை மற்றவரின் உரிமையைப் புறக்கணிக்க காரணமாக்காதீர்கள்.',
      },
      {
        title: 'A daily character check',
        titleTamil: 'தினசரி நற்பண்பு சுயபரிசோதனை',
        english: 'At the end of the day, ask: Did I keep my word? Did I hurt anyone with my speech or actions? Is there a right I need to restore or an apology I should make? Ask Allah for help, make amends where possible, and keep working on one habit at a time.',
        tamil: 'நாளின் முடிவில் உங்களிடம் கேளுங்கள்: நான் சொன்னதை நிறைவேற்றினேனா? என் சொல் அல்லது செயலால் யாரையாவது காயப்படுத்தினேனா? திருப்பித் தர வேண்டிய உரிமையோ, கேட்க வேண்டிய மன்னிப்போ உள்ளதா? அல்லாஹ்விடம் உதவி கேட்டு, இயன்ற இடத்தில் சரிசெய்து, ஒவ்வொரு முறையும் ஒரு பழக்கத்தை மேம்படுத்த முயலுங்கள்.',
      },
    ],
    references: ['Quran 16:90', 'Quran 4:36', 'Sahih Muslim 2586'],
  },
  {
    id: 'kind-speech',
    subject: 'akhlaq',
    title: 'Speak Good Words',
    tamil: 'நல்ல சொற்களைப் பேசுதல்',
    sections: [
      {
        title: 'Words have consequences',
        titleTamil: 'சொற்களுக்கு விளைவுகள் உண்டு',
        english: 'Allah instructs people to speak what is best. Words can comfort and reconcile, but they can also humiliate, divide, and spread falsehood. A believer treats speech as a responsibility, whether speaking face to face or posting online.',
        tamil: 'மிகச் சிறந்த சொற்களைப் பேசுமாறு அல்லாஹ் அறிவுறுத்துகிறான். சொற்கள் ஆறுதல் அளித்து சமாதானம் செய்யலாம்; அவமதித்து, பிரித்து, பொய்யைப் பரப்பவும் செய்யலாம். நேரில் பேசும்போதும் இணையத்தில் எழுதும்போதும் ஒரு முஃமின் பேச்சை பொறுப்பாகக் கருதுகிறார்.',
      },
      {
        title: 'A simple check before speaking',
        titleTamil: 'பேசுவதற்கு முன் சிந்தித்தல்',
        english: 'Ask whether what you are about to say is true, useful, and appropriately kind. Verify news before sharing it. Avoid mockery, name-calling, backbiting, and suspicion. If you cannot improve the conversation, silence may be safer than adding hurtful words.',
        tamil: 'நீங்கள் சொல்லப் போவது உண்மையா, பயனுள்ளதா, பொருத்தமான அன்புடன் உள்ளதா என்று சிந்தியுங்கள். செய்திகளைப் பகிர்வதற்கு முன் சரிபாருங்கள். கேலி, இழிவான பெயரிடல், புறம்பேசுதல், ஆதாரமற்ற சந்தேகம் ஆகியவற்றைத் தவிருங்கள். உரையாடலை மேம்படுத்த முடியாவிட்டால், காயப்படுத்தும் சொற்களைச் சேர்ப்பதைவிட அமைதியாக இருப்பது பாதுகாப்பானதாக இருக்கலாம்.',
      },
      {
        title: 'Correct with wisdom',
        titleTamil: 'ஞானத்துடன் திருத்துதல்',
        english: 'When advice is needed, choose a suitable time and speak privately when possible. Describe the action rather than insulting the person, listen to their explanation, and offer a helpful alternative. Good advice aims at benefit and reconciliation, not winning an argument.',
        tamil: 'அறிவுரை தேவைப்படும்போது பொருத்தமான நேரத்தைத் தேர்ந்தெடுத்து, இயன்றால் தனியாகப் பேசுங்கள். ஒருவரை அவமதிப்பதற்குப் பதிலாக அந்தச் செயலைப் பற்றி கூறி, அவர்களின் விளக்கத்தையும் கேட்டு, பயனுள்ள மாற்று வழியை முன்வையுங்கள். நல்ல அறிவுரையின் நோக்கம் நன்மையும் சமாதானமுமே; வாதத்தில் வெல்வது அல்ல.',
      },
    ],
    references: ['Quran 2:83', 'Quran 17:53', 'Quran 49:11-12'],
  },
];

export function getLessonSubject(subjectId) {
  return LESSON_SUBJECTS.find(subject => subject.id === subjectId) || null;
}

export function getLessonsBySubject(subjectId) {
  return LESSONS.filter(lesson => lesson.subject === subjectId);
}

export function getLesson(subjectId, lessonId) {
  return LESSONS.find(lesson => lesson.subject === subjectId && lesson.id === lessonId) || null;
}
