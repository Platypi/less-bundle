/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import globals = require('./globals');
import getFiles = require('./getfiles');
import buildContents = require('./buildcontents');
import generateOutput = require('./generateoutput');

function writeToFile(path: string, data: Array<string>) {
    try {
        var fd = fs.openSync(path, 'w'),
            buffer = new Buffer(data.join('\n'), 'utf8');

        fs.writeSync(fd, buffer, 0, buffer.length, 0);
        fs.closeSync(fd);
    } catch (err) {
        console.log('Could not write to file: ' + JSON.stringify(err, null, 4));
    }
}

/**
 * Uses the config to go through all of the framework *.less files in the 
 * proper order and compresses them into a single file for packaging.
 * 
 * @param config The configuration for compressing the files.
 * @param callback Since this is asynchronous, we need a callback to know 
 * when the task is complete.
 */
function compress(config?: globals.IConfig, callback?: (err) => void) {
    globals.initialize(config);

    var src = path.resolve(globals.config.src),
        writers = globals.writers,
        imports = globals.imports,
        output = globals.output,
        dest = globals.config.dest,
        version = globals.config.version,
        license = globals.config.license;
    
    // Goes through each file in the dest files and makes sure they have a 
    // .less extension.
    dest.forEach((outFile, index) => {
        var end = outFile.lastIndexOf('.');
        dest[index] = outFile.substring(0, (end > -1) ? end : undefined) + '.less';
    });

    // Reads the src file, builds the contents for each 
    // file in the proper order, and generates the output file.
    fs.readFile(src, 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }
        var files = getFiles(data),
            fileData = '',
            allLines: Array<string> = [];

        if (files.length === 0) {
            return callback(
                new Error(
                    'No files found to bundle, do you have <!-- less-bundle-start --> and <!-- less-bundle-end --> in your src file?'
                )
            );
        }

        // Gather all the lines from all the files into an array.
        files.forEach((file) => {
            fileData = fs.readFileSync(path.resolve(src, '..', file), 'utf8');
            var lines = fileData.split(/\r\n|\n/);
            lines[0] = lines[0].trim();
            allLines = allLines.concat(lines);
        });
        
        buildContents(allLines);
        generateOutput();

        // If a license file is specified, we want to prepend it to the output.
        if (!!license) {
            var licenseFile = path.resolve(license),
                licenseData = fs.readFileSync(licenseFile, 'utf8'),
                lines = licenseData.split(/\r\n|\n/),
                regex = /(.*)v\d+\.\d+\.\d+(.*)/;

            // If a version is specified, we want to go through and find where 
            // the version is specified in the license, then replace it with the 
            // passed-in version.
            if (!!version) {
                lines.some((line, index) => {
                    if (regex.test(line)) {
                        lines[index] = line.replace(regex, '$1v' + version + '$2');
                        return true;
                    }
                    return false;
                });
            }

            // Add the lines as a comment block
            lines.forEach((line, index) => {
                lines[index] = ' * ' + line;
            });

            lines.unshift('/**');
            lines.push(' */');

            output.unshift(lines.join('\n'));
        }

        // Make sure the file ends in a new line.
        if (!!output[output.length - 1].trim()) {
            output.push('');
        }

        // Go through each destination file and make sure we can 
        // write a file to the location, making new directories 
        // if necessary. Then write the output to each destination.
        dest.forEach((destFile) => {
            var destPath = path.resolve(destFile),
                split = path.resolve(destPath, '..').split(/\/|\\/),
                concat = '';

            if (/[a-zA-Z]:/.test(split[0])) {
                split.shift();
                split.unshift('/' + split.shift());
            }

            split.forEach((val) => {
                concat += val + '/';
                try {
                    fs.mkdirSync(concat);
                } catch (err) {
                    // The directory probably already exists.
                }
            });

            writeToFile(destPath, output);
        });

        callback(err);
    });
}

export = compress;
