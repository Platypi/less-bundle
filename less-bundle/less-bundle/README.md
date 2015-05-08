#Less Bundle

Bundle all of your LESS files into a single file. Useful for large projects with multiple components utilizing their own LESS files.

## Usage

```javascript
var bundle = require('less-bundle');

bundle({
    src: 'main.less',
    dest: 'out.less'
}, function (err) {
  // log err
});
```

## Options

```typescript
interface IConfig {
    /**
     * The path to a LESS file that imports all the desired files 
     * in the order you wish them to be bundled in.
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
```

