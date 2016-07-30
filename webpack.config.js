module.exports = {
    entry: __dirname + "/react/App.js",
    devtool: 'inline-source-map',
    output: {
        path: __dirname + "/public/javascripts",
        filename: "Bundle.js"
    },
    module: {
        loaders: [{
            test: /\.jsx$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                presets: ['es2015', 'react']
            }
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                presets: ['es2015', 'react']
            }
        }]
    }
};
