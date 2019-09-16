const chalk = require('chalk'),
    common = require('./common'),
    child_process = require('child_process'),
    handler = require('./handler');

module.exports = {
    start: (agentName, delay, times, args) => {
        agentName = processAgentName(agentName);
        if(!delay) delay = 300;
        if(!times) times = -1;
        if(!args) args = [];
        let record = {
            args: args,
            iteration: 0,
            delay: delay,
            times: times,
            status: 'STARTED'
        }
        let forkedProcess = child_process.fork(__dirname + '/forked_process.js', [agentName, JSON.stringify(record)], { detached: true });
        forkedProcess.on('message', record => {
            console.log(chalk.green('\u2714 ' + agentName + ' agent started.\npid: ' + forkedProcess.pid));
            if(record.status != 'SUCCESS'){
                console.log(chalk.red('\u274c There seems to be some error when running ' + agentName + ' agent. Kindly consider stopping the agent.'));
            }
            process.exit();
        })

    },
    stopAll: (agentName) => {
        agentName = processAgentName(agentName);
        let allRecords = common.getAllRecords(agentName);
        common.deleteAllRecords(agentName);
        
        let pids = Object.keys(allRecords);
        if(!pids || pids.length == 0){
            console.log('No ' + agentName + ' agents running currently.');
            return;
        }
        pids.forEach(pid => {
            console.log(chalk.green('\u2714 ' + agentName + ' agent stopped sucessfully.\npid: ' + pid));
            
            try {
                if (process.pid == pid) {
                    process.exit();
                } else {
                    process.kill(pid);
                }
            } catch (e) { }
        })
    },
    stop: (agentName, pid, silent) => {
        agentName = processAgentName(agentName);
        let record = common.getRecord(agentName, pid);
        if(!record) return;

        common.deleteRecord(agentName, pid);
        if (!silent) console.log(chalk.green('\u2714 ' + agentName + ' agent stopped sucessfully.\npid: ' + pid));

        try {
            if(process.pid == pid){
                process.exit();
            } else {
                process.kill(pid);
            }
        } catch(e){ }
    },
    show: (agentName, args) => {
        agentName = processAgentName(agentName);
        let agentInstance = common.loadAgent(agentName);
        let agentHandler = handler(agentName);
        agentInstance.display(agentHandler, args);
    }
    
}

function processAgentName(agentName){
    return agentName.toLowerCase();
}