const os = require('os'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

const WATCH_AGENT_REPO = process.env.WATCH_AGENT_REPO;
const WATCH_AGENT_HOME_PATH = path.join(os.homedir(), '.watch-agent');

module.exports = {
    loadAgent: (agentName) => {
        mkdirp.sync(WATCH_AGENT_HOME_PATH);
        let filePath = path.join(WATCH_AGENT_REPO, 'wa-'+agentName, 'index.js');
        let agentInstance = require(filePath);

        if (!agentInstance instanceof Object) {
            throw agentName + ' agent should be an Object.';
        }

        if(agentInstance.init && !agentInstance.init instanceof Function){
            throw 'init() is not a function.'
        }

        if (!agentInstance.fetch || !agentInstance.fetch instanceof Function) {
            throw 'fetch() function is not defined.'
        }

        if (agentInstance.infer && !agentInstance.infer instanceof Function) {
            throw 'infer() is not a function.'
        }

        if (!agentInstance.display || !agentInstance.display instanceof Function) {
            throw 'display() function is not defined.'
        }

        agentInstance._name = agentName;
        return agentInstance;
    },
    pushRecord: (agentName, pid, data) => {
        let agentDataFilePath = getAgentDataFilePath(agentName);
        let allData = readFile(agentDataFilePath);
        allData[pid] = data;
        writeFile(agentDataFilePath, allData);
    },
    deleteRecord: (agentName, pid) => {
        let agentDataFilePath = getAgentDataFilePath(agentName);
        let allData = readFile(agentDataFilePath);
        delete allData[pid];
        writeFile(agentDataFilePath, allData);
    },
    deleteAllRecords: (agentName) => {
        let agentDataFilePath = getAgentDataFilePath(agentName);
        writeFile(agentDataFilePath, {});
    },
    getRecord: (agentName, pid) => {
        let agentDataFilePath = getAgentDataFilePath(agentName);
        let allData = readFile(agentDataFilePath);
        return allData[pid];
    },
    getAllRecords: (agentName) => {
        let agentDataFilePath = getAgentDataFilePath(agentName);
        let allData = readFile(agentDataFilePath);
        return allData;
    }
}

function getAgentDataFilePath(agentName){
    let agentDataFilePath = path.join(WATCH_AGENT_HOME_PATH, agentName + '.json');
    if (!fs.existsSync(agentDataFilePath)) {
        fs.writeFileSync(agentDataFilePath, JSON.stringify({}));
    }
    return agentDataFilePath;
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