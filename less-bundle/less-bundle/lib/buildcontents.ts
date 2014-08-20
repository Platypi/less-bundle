/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import Writer = require('./writer');
import globals = require('./globals');

function buildContents(lines: Array<string>, filePath: string) {
    var writers = globals.writers,
        imports = globals.imports,
        lessRegex = globals.lessFileRegex,
        cssRegex = globals.cssFileRegex,
        stringLiteralRegex = globals.stringLiteralRegex,
        currentLines: Array<string> = [],
        line: string,
        hashPath: string,
        imported: string,
        file: string,
        splitLines: Array<string>;

    if (typeof imports[filePath] === 'undefined') {
        imports[filePath] = true;
    }

    for (var index = 0; index < lines.length; ++index) {
        line = lines[index].trim();

        if (line.indexOf('@import ') === 0) {
            // We found an import statement
            if (currentLines.length > 0) {
                writers.push(new Writer(currentLines));
                currentLines = [];
            }

            imported = line.replace(stringLiteralRegex, '$1');
            if (!(lessRegex.test(imported) || cssRegex.test(imported))) {
                imported += '.less';
            }

            hashPath = path.resolve(filePath, '..', imported);
            if (typeof imports[hashPath] === 'undefined') {
                imports[hashPath] = true;
                file = fs.readFileSync(hashPath, 'utf8');
                splitLines = file.split(/\r\n|\n/);
                splitLines[0] = splitLines[0].trim();
                buildContents(splitLines, hashPath);
            }

            continue;
        }

        currentLines.push(lines[index]);
    }

    // Push all remaining lines
    writers.push(new Writer(currentLines));
    return index;
}

export = buildContents;
