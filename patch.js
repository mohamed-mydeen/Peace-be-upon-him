const fs = require('fs');
let content = fs.readFileSync('src/pages/Hadith.jsx', 'utf-8');

const copyFunc = `
  const copyHadith = (h) => {
    const text = \`[\${h.id}] \\n\${h.arab}\\n\\n\${h.translation}\`;
    navigator.clipboard.writeText(text);
  };
`;

content = content.replace('const [bookName, setBookName] = useState(\'\');\n  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();', 'const [bookName, setBookName] = useState(\'\');\n  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();\n' + copyFunc);

fs.writeFileSync('src/pages/Hadith.jsx', content);
