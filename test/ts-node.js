const tsNode = require('ts-node');
const config = require('./tsconfig.json');

tsNode.register({
    files: true,
    transpileOnly: true,
    project: './tsconfig.json'
});
