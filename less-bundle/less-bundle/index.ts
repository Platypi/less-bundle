import compress = require('./lib/compressor');
import globals = require('./lib/globals');
//export = compress;

function bundle(grunt: IGrunt) {
    grunt.registerMultiTask('less', 'Packages multiple LESS files', function () {
        var done = this.async(),
            data = <globals.IConfig>this.data;
        compress(data, (err) => {
            if (err) {
                grunt.log.error(err);
            }
            done();
        });
    });
}

export = bundle;
