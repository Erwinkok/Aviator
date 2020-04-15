var path = require('path');

const config = {
    mode: "development",
    entry: {
        app: "./src/index.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {        
                test: /\.(js|jsx)$/, // rule for .js files    
                include: [
                    path.resolve(__dirname, "app")
                ],    
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
                loader: "babel-loader"  
            }
        ]
    }
}

module.exports = config;
