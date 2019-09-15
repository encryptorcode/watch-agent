const common = require('./common');
const main = require('./main');
const handler = require('./handler');

let moduleName = process.argv[2];
let record = JSON.parse(process.argv[3]);
let moduleInstance = common.loadModule(moduleName);
let moduleHandler = handler(moduleName, process.pid);

record.pid = process.pid;
common.pushRecord(moduleName, record.pid, record);
iterate(moduleName, record.pid);

function iterate(moduleName, pid) {
    
    let record = common.getRecord(moduleName, pid);

    let args = record.args;
    let iteration = ++record.iteration;
    let delay = record.delay;
    let times = record.times;

    let initDataPromise;
    if (moduleInstance.init && record.iteration == 1) {
        initDataPromise = convertToPromise(moduleInstance.init(moduleHandler, record.args));
    } else {
        initDataPromise = convertToPromise(args);
    }

    initDataPromise.then(initData => {
        if(initData == false){
            main.destroy(moduleName, pid, true);
        } else {
            record.args = initData;
        }

        let dataPromise = convertToPromise(moduleInstance.fetch(moduleHandler, initData));
        dataPromise.then(data => {
            if (moduleInstance.infer) {
                moduleInstance.infer(moduleHandler, data);
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
        common.pushRecord(moduleName, pid, newRecord);
        if (iteration == 1) {
            process.send(newRecord);
        }
        if (iteration == times) {
            main.destroy(moduleName, pid, true);
        } else {
            setTimeout(iterate, delay * 1000, moduleName, pid);
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