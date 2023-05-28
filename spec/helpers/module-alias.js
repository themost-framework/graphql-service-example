const {addAliases} = require('module-alias');
const path = require('path');
const config = require('../../jsconfig.json');
if (config.compilerOptions && config.compilerOptions.paths) {
    const aliases = Object.keys(config.compilerOptions.paths).map((key) => {
        const path1 = config.compilerOptions.paths[key][0];
        return [
            key,
            path.resolve(process.cwd(), config.compilerOptions.baseUrl, path1)
        ];
    }).reduce((previous, current) => {
        previous[current[0]] = current[1];
        return previous;
    }, {});
    addAliases(aliases);
}