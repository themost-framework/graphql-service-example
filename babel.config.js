/* eslint-disable quotes */
module.exports = function (api) {
    api.cache(false);
    return {
        "sourceMaps": "inline",
        "retainLines": true,
        "presets": [
            [
                "@babel/preset-env",
                {
                    "targets": {
                        "node": "current"
                    }
                }
            ]
        ],
        "ignore":  [
            /\/node_modules/
        ]
    };
};