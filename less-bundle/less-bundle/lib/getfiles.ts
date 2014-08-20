import globals = require('./globals');

/**
 * Iterates through the index.html file data, finding all the 
 * script tags between the start and end comment nodes. Takes 
 * the src value of each script tag and changes the extension 
 * from .js to .ts. Returns an array of all the .ts files in 
 * the same order they appear in the index.html.
 * 
 * @param data The string output from reading the index.html 
 * file.
 */
function getFiles(data: string) {
    if (typeof data !== 'string') {
        return [];
    }

    var lines = data.split(/\r\n|\n/),
        files = [],
        running = false;

    // We want to go through the lines until we hit an end tag.
    lines.some((line) => {
        line = line.trim();

        // If we hit the start tag, we need to start checking for script tags.
        if (!running && globals.startRegex.test(line)) {
            running = true;
            return false;

        // If we hit the end tag, we need to stop checking for script tags. 
        } else if (running && globals.endRegex.test(line)) {
            return true;
        // We want to ignore script tags if we haven't hit a start tag yet.
        } else if (!running) {
            return false;
        }

        var exec = globals.srcRegex.exec(line);

        // Ignore the tag if it is not a script tag with a *.js src value.
        if (!exec || exec[1].indexOf('.js') === -1) {
            return false;
        }

        files.push(exec[1].replace('.js', '.ts').substr(1));

        return false;
    });

    return files;
}

export = getFiles;
