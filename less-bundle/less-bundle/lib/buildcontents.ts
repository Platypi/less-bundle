/// <reference path="../typings/tsd.d.ts" />

import Writer = require('./writer');
import globals = require('./globals');
import path = require('path');

function buildContents(lines: Array<string>) {
    var writers = globals.writers,
        imports = globals.imports,
        lessRegex = globals.lessFileRegex,
        cssRegex = globals.cssFileRegex,
        stringLiteralRegex = globals.stringLiteralRegex,
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

            hashPath = path.resolve(imported);
            imports[hashPath] = true;
        } else {
            currentLines.push(lines[index]);
        }

        previousLine = line;
    }

    // Push all remaining lines to the root module.
    writers.push(new Writer(currentLines));
    return index;
}

export = buildContents;
