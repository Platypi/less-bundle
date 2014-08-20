class Writer {
    private __lines: Array<string>;

    /**
     * Creates a new Writer with the given lines.
     * 
     * @param lines The lines to set for the Writer.
     */
    constructor(lines: Array<string>);

    /**
     * Creates a new Writer with the given module.
     * 
     * @param mod The module to set for this writer.
     */
    constructor(operator) {
        if (Array.isArray(operator)) {
            this.__lines = operator;
            return;
        }
    }

    /**
     * Writes the lines for this writer into the output array, then calls the callback with the 
     * module associated with this writer.
     * 
     * @param output The output lines to which the Writer's lines should be appended.
     * @param previousLine The previous line that was added to output.
     * @param callback A method that takes in the next module with which to continue 
     * output generation.
     */
    write(output: Array<string>, previousLine: string) {
        // If this writer has a module associated with it, we want to first add the 
        // lines for the module before adding the lines for this writer.
        var trim: string;

        // Add every line to the output.
        this.__lines.forEach((line) => {
            trim = line.trim();

            if (!previousLine && !trim) {
                return;
            }
            output.push(line);
            previousLine = trim;
        });

        return previousLine;
    }
}

export = Writer;
