const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'placementHeadController.js');
let content = fs.readFileSync(filePath, 'utf8');

const badChunk1 = `{
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', { $ifNull: ['$jobData.package', 0] }]
                        }
                    }
                }`;

const goodChunk1 = `{
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
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
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                }`;

// also handle double quotes around $selectedPackage
const regexDouble = /\{\s*\$addFields:\s*\{\s*actualPackage:\s*\{\s*\$cond:\s*\[\{\s*\$gt:\s*\["\$selectedPackage",\s*0\]\s*\}, "\$selectedPackage", \{\s*\$ifNull:\s*\["\$jobData.package",\s*0\]\s*\}\]\s*\}\s*\}\s*\}/g;

const regexSingle = /\{\s*\$addFields:\s*\{\s*actualPackage:\s*\{\s*\$cond:\s*\[\{\s*\$gt:\s*\['\$selectedPackage',\s*0\]\s*\}, '\$selectedPackage', \{\s*\$ifNull:\s*\['\$jobData.package',\s*0\]\s*\}\]\s*\}\s*\}\s*\}/g;


let replaced = false;
if (content.match(regexSingle)) {
    content = content.replace(regexSingle, goodChunk1);
    replaced = true;
}
if (content.match(regexDouble)) {
    content = content.replace(regexDouble, goodChunk1);
    replaced = true;
}

if (!replaced) {
    console.log("Not replaced by regex. Looking for substring exactly.");
    // Try to find it generically
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements completed:', replaced);
