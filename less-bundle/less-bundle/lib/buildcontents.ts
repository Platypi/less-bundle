/// <reference path="../typings/tsd.d.ts" />

import Writer = require('./writer');
import globals = require('./globals');
import path = require('path');

function buildContents(lines: Array<string>, filePath: string) {
    var writers = globals.writers,
        imports = globals.imports,
        lessRegex = globals.lessFileRegex,
        cssRegex = globals.cssFileRegex,
        stringLiteralRegex = globals.stringLiteralRegex,
        ignores = globals.config.ignore,
        previousLine = '',
        currentLines: Array<string> = [],
        line: string,
        hashPath: string,
        imported: string;

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
            if (ignores.indexOf(hashPath) === -1 && typeof imports[hashPath] === 'undefined') {
                imports[hashPath] = true;
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
