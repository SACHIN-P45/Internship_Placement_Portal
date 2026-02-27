const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'controllers', 'placementHeadController.js');
let content = fs.readFileSync(filePath, 'utf8');

const regex1 = /\["\$value",\s*"\$this\.match"\]/g;
content = content.replace(regex1, '["$$$$value", "$$$$this.match"]');

const regex2 = /\['\$value',\s*'\$this\.match'\]/g;
content = content.replace(regex2, "['$$$$value', '$$$$this.match']");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced');
