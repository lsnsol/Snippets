/**
 * Realtime txt file data display of last n lines (taken from command line)
 */

const fse = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

const filePath = path.join(__dirname, 'test.txt');
const watcher = chokidar.watch(filePath, {ignored: /^\./, persistent: true});

var data = (fse.readFileSync(filePath) + '').split('\n');
var noOfLines = (process.argv[2]) ? process.argv[2] : ((data.length > 10) ? 10 : data.length);
console.log(data.slice(-noOfLines).join('\n'));

watcher.on('change', path => {
    data = (fse.readFileSync(filePath) + '').split('\n');    
    noOfLines = (process.argv[2]) ? process.argv[2] : ((data.length > 10) ? 10 : data.length);
    console.log('\u001b[2J\u001b[0;0H');
    console.log(data.slice(-noOfLines).join('\n'));
});