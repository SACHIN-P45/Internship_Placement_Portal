const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'placementHeadController.js');
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `{
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                { $divide: ['$parsedPackage', 100000] },
                                0
                            ]
                        }
                    }
                }`;

const replacement1 = `{
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                { $divide: [
                                    { $cond: [
                                        { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                        { $multiply: ['$parsedPackage', 12] },
                                        '$parsedPackage'
                                    ]},
                                100000] },
                                0
                            ]
                        }
                    }
                }`;

const target2 = `{
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ["$parsedPackage", 0] },
                                { $divide: ["$parsedPackage", 100000] },
                                0
                            ]
                        }
                    }
                }`;

const replacement2 = `{
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ["$parsedPackage", 0] },
                                { $divide: [
                                    { $cond: [
                                        { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                        { $multiply: ['$parsedPackage', 12] },
                                        '$parsedPackage'
                                    ]},
                                100000] },
                                0
                            ]
                        }
                    }
                }`;

// Fix occurrences with single quotes
if (content.includes(target1)) {
    content = content.split(target1).join(replacement1);
    console.log('Replaced target1');
} else {
    console.log('Target1 not found. Attempting regex...');
}

// Fix occurrences with double quotes
if (content.includes(target2)) {
    content = content.split(target2).join(replacement2);
    console.log('Replaced target2');
}

// In case whitespace is unpredictable:
const regex1 = /\{\s*\$addFields:\s*\{\s*finalPackageLPA:\s*\{\s*\$cond:\s*\[\s*\{\s*\$gt:\s*\['\$parsedPackage',\s*0\]\s*\},\s*\{\s*\$divide:\s*\['\$parsedPackage',\s*100000\]\s*\},\s*0\s*\]\s*\}\s*\}\s*\}/g;

const regex2 = /\{\s*\$addFields:\s*\{\s*finalPackageLPA:\s*\{\s*\$cond:\s*\[\s*\{\s*\$gt:\s*\["\$parsedPackage",\s*0\]\s*\},\s*\{\s*\$divide:\s*\["\$parsedPackage",\s*100000\]\s*\},\s*0\s*\]\s*\}\s*\}\s*\}/g;

if (regex1.test(content) || regex2.test(content)) {
    content = content.replace(regex1, replacement1);
    content = content.replace(regex2, replacement2);
    console.log('Replaced using regex');
}


fs.writeFileSync(filePath, content, 'utf8');
console.log('Done.');
