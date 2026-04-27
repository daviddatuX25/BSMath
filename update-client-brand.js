const fs = require('fs');
const path = require('path');
const files = ['client/announcements.html', 'client/events.html', 'client/faculty.html', 'client/gallery.html', 'client/news.html', 'client/programs.html'];
const oldStr = '    <a href="index.html" class="brand">BS Mathematics</a>';
const newStr = '    <a href="index.html" class="brand">\n      <div class="brand-logo">Σ</div>\n      <span class="brand-text">BS Mathematics</span>\n    </a>';
for (const file of files) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldStr)) {
      fs.writeFileSync(file, content.replace(oldStr, newStr), 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}
