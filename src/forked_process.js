const common = require('./common'),
    main = require('./main'),
    handler = require('./handler');

let agentName = process.argv[2];
let record = JSON.parse(process.argv[3]);
let agentInstance = common.loadAgent(agentName);
let agentHandler = handler(agentName, process.pid);

record.pid = process.pid;
common.pushRecord(agentName, record.pid, record);
iterate(agentName, record.pid);

function iterate(agentName, pid) {
    
    let record = common.getRecord(agentName, pid);

    let args = record.args;
    let iteration = ++record.iteration;
    let delay = record.delay;
    let times = record.times;

    let initDataPromise;
    if (agentInstance.init && record.iteration == 1) {
        initDataPromise = convertToPromise(agentInstance.init(agentHandler, record.args));
    } else {
        initDataPromise = convertToPromise(args);
    }

    initDataPromise.then(initData => {
        if(initData == false){
            main.stop(agentName, pid, true);
        } else {
            record.args = initData;
        }

        let dataPromise = convertToPromise(agentInstance.fetch(agentHandler, initData));
        dataPromise.then(data => {
            if (agentInstance.infer) {
                agentInstance.infer(agentHandler, data);
            }
            record.data = data;
            record.status = 'SUCCESS';
            finalize(record);
        }).catch(error => {
            console.trace(error);
            record.error = error;
            record.status = 'FAILED';
            finalize(record);
        })
    })

    function finalize(newRecord) {
        record.lastExecutionTime = new Date().toLocaleString();
        common.pushRecord(agentName, pid, newRecord);
        if (iteration == 1) {
            process.send(newRecord);
        }
        if (iteration == times) {
            main.destroy(agentName, pid, true);
        } else {
            setTimeout(iterate, delay * 1000, agentName, pid);
        }
    }
}

function convertToPromise(obj) {
    if (!(obj instanceof Promise)) {
        obj = new Promise(resolve => {
            resolve(obj);
        })
    }
    return obj;
}