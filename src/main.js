const chalk = require('chalk');
const common = require('./common');
const child_process = require('child_process');

module.exports = {
    init: (moduleName, delay, times, args) => {
        moduleName = processModuleName(moduleName);
        if(!delay) delay = 300;
        if(!times) times = -1;
        if(!args) args = [];
        let record = {
            args: args,
            iteration: 0,
            delay: delay,
            times: times,
            status: 'INITIATED'
        }
        let forkedProcess = child_process.fork('./src/forked_process.js', [moduleName, JSON.stringify(record)], { detached: true });
        console.log(chalk.green('\u2714 Agent initiated for ' + moduleName + '.\npid: ' + forkedProcess.pid));
        forkedProcess.on('message', record => {
            if(record.status != 'SUCCESS'){
                console.log(chalk.red('\u274c There seems to be some error when running ' + moduleName + ' process. Kindly consider destroying the process.'));
            }
            process.exit();
        })

    },
    destroyAll: (moduleName) => {
        moduleName = processModuleName(moduleName);
        let allRecords = common.getAllRecords(moduleName);
        common.deleteAllRecords(moduleName);
        
        Object.keys(allRecords).forEach(pid => {
            console.log(chalk.green('\u2714 Process destroyed sucessfully: ' + pid));
            
            try {
                if (process.pid == pid) {
                    process.exit();
                } else {
                    process.kill(pid);
                }
            } catch (e) { }
        })
    },
    destroy: (moduleName, pid, silent) => {
        moduleName = processModuleName(moduleName);
        let record = common.getRecord(moduleName, pid);
        if(!record) return;

        common.deleteRecord(moduleName, pid);
        if (!silent) console.log(chalk.green('\u2714 Process destroyed sucessfully: ' + pid));

        try {
            if(process.pid == pid){
                process.exit();
            } else {
                process.kill(pid);
            }
        } catch(e){ }
    },
    show: (moduleName, args) => {
        moduleName = processModuleName(moduleName);
        let moduleInstance = common.loadModule(moduleName);
        let allRecords = common.getAllRecords(moduleName);
        let displayRecords = [];
        Object.values(allRecords).forEach(record => {
            if(record.status == 'SUCCESS' || record.status == 'FAILED'){
                displayRecords.push(record);
            }
        })
        moduleInstance.display(displayRecords, args);
    }
    
}

function processModuleName(moduleName){
    return moduleName.toLowerCase();
}