const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'controllers', 'placementHeadController.js');
let content = fs.readFileSync(filePath, 'utf8');

let replaced = false;

if (content.includes('["$value", "$this.match"]')) {
    content = content.replaceAll('["$value", "$this.match"]', '["$$value", "$$this.match"]');
    replaced = true;
}

if (content.includes("['$value', '$this.match']")) {
    content = content.replaceAll("['$value', '$this.match']", "['$$value', '$$this.match']");
    replaced = true;
}

if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Replaced:', replaced);
