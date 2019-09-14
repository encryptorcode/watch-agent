const os = require('os');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const WATCH_AGENT_MODULES = process.env.WATCH_AGENT_MODULES;
const WATCH_AGENT_HOME_PATH = path.join(os.homedir(), ".watch-agent");

module.exports = {
    loadModule: (moduleName) => {
        mkdirp.sync(WATCH_AGENT_HOME_PATH);
        let filePath = path.join(WATCH_AGENT_MODULES, 'wa-'+moduleName, "index.js");
        let moduleInstance = require(filePath);

        if (!moduleInstance instanceof Object) {
            throw 'Watch Agent module should be an Object.';
        }

        if (!moduleInstance.fetch || !moduleInstance.fetch instanceof Function) {
            throw 'fetch() function is not defined.'
        }

        if (!moduleInstance.infer || !moduleInstance.infer instanceof Function) {
            throw 'infer() function is not defined.'
        }

        if (!moduleInstance.display || !moduleInstance.display instanceof Function) {
            throw 'display() function is not defined.'
        }

        moduleInstance._name = moduleName;
        return moduleInstance;
    },
    pushRecord: (moduleName, pid, data) => {
        let moduleDataFilePath = getModuleDataFilePath(moduleName);
        let allData = readFile(moduleDataFilePath);
        allData[pid] = data;
        writeFile(moduleDataFilePath, allData);
    },
    deleteRecord: (moduleName, pid) => {
        let moduleDataFilePath = getModuleDataFilePath(moduleName);
        let allData = readFile(moduleDataFilePath);
        delete allData[pid];
        writeFile(moduleDataFilePath, allData);
    },
    deleteAllRecords: (moduleName) => {
        let moduleDataFilePath = getModuleDataFilePath(moduleName);
        writeFile(moduleDataFilePath, {});
    },
    getRecord: (moduleName, pid) => {
        let moduleDataFilePath = getModuleDataFilePath(moduleName);
        let allData = readFile(moduleDataFilePath);
        return allData[pid];
    },
    getAllRecords: (moduleName) => {
        let moduleDataFilePath = getModuleDataFilePath(moduleName);
        let allData = readFile(moduleDataFilePath);
        return allData;
    }
}

function getModuleDataFilePath(moduleName){
    let moduleDataFilePath = path.join(WATCH_AGENT_HOME_PATH, moduleName + '.json');
    if (!fs.existsSync(moduleDataFilePath)) {
        fs.writeFileSync(moduleDataFilePath, JSON.stringify({}));
    }
    return moduleDataFilePath;
}
function readFile(filePath){
    let fileContents = fs.readFileSync(filePath);
    let data = JSON.parse(fileContents.toString('utf8'));
    return data;
}
function writeFile(filePath, data){
    let fileContents = JSON.stringify(data);
    fs.writeFileSync(filePath, fileContents);
}