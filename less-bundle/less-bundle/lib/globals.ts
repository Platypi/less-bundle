/// <reference path="../typings/tsd.d.ts" />

import Writer = require('./writer');
import path = require('path');

export interface IConfig {
    /**
     * The index.html file used to find all the *.less files and 
     * build them in order. Starts at the <!-- less-bundle-start -->
     * comment and ends at <!-- less-bundle-end -->
     */
    src: string;

    /**
     * An array of destination file paths. Once the framework 
     * is built, it will be output to these paths.
     */
    dest: Array<string>;

    /**
     * The version number used in conjunction with the license.
     */
    version?: string;

    /**
     * The path to the license file to be added to the build as a
     * comment. If a version is specified, the v.0.0.0 in the 
     * license will be replaced with the version.
     */
    license?: string;
}

export interface IObject<T> {
    [x: string]: T;
}

function isString(obj: any): boolean {
    return typeof obj === 'string';
}

function isArray(obj: any): boolean {
    return Array.isArray(obj);
}

function validate(config: IConfig): Array<string> {
    var errors: Array<string> = [];

    if (!isString(config.src) || config.src.indexOf('.html') < 0) {
        errors.push('Error: src config property must be a string locating the html file for the bundle');
    }

    if (!isArray(config.dest)) {
        errors.push('Error: dest config property must be a string or array of strings designating the output file(s).');
    }

    return errors;
}

/**
 * Creates the config.
 * 
 * @param cfg The root config.
 */
export function initialize(cfg: IConfig) {
    if (!cfg) {
        throw new Error('No config specified');
    }
    config = cfg;

    if (typeof cfg.dest === 'string') {
        config.dest = [<string><any>cfg.dest];
    }

    var errors = validate(config);

    if (errors.length > 0) {
        errors.forEach((error) => { console.log(error); });
        throw new Error('Invalid config');
    }

    return config;
}

export var config: IConfig,
    writers: Array<Writer> = [],
    output: Array<string> = [],

    // hashes the import statements
    imports: IObject<boolean> = {},

    // Finds all the <script src="" /> tags
    hrefRegex = /href=("[^"]*)/,

    // Finds the start comment Node
    startRegex = /<!--\s*less-bundle-start/,

    // Finds the end comment Node
    endRegex = /<!--\s*less-bundle-end/,

    // Finds the string literal in a string
    stringLiteralRegex = /.*(?:'|")(.*)(?:'|").*/,

    // Tests for less file
    lessFileRegex = /.less$/,

    // Tests for css file
    cssFileRegex = /.css$/;
