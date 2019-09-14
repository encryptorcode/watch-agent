const common = require('./common');
const main = require('./main');

let moduleName = process.argv[2];
let record = JSON.parse(process.argv[3]);
let moduleInstance = common.loadModule(moduleName);

record.pid = process.pid;
common.pushRecord(moduleName, record.pid, record);
iterate(moduleName, record.pid);

function iterate(moduleName, pid) {
    
    let record = common.getRecord(moduleName, pid);

    let args = record.args;
    let iteration = ++record.iteration;
    let delay = record.delay;
    let times = record.times;
    let previousRecord = record.status == 'INITIATED' ? undefined : clone(record);

    let rawDataPromise = convertToPromise(moduleInstance.fetch(previousRecord, args));
    rawDataPromise.then(rawData => {
        let processedDataPromise = convertToPromise(moduleInstance.infer(previousRecord, args, rawData));
        processedDataPromise.then(processedData => {
            record.data = processedData;
            record.status = 'SUCCESS';
            finalize(record);
        }).catch(error => {
            console.trace(error);
            record.error = error;
            record.status = 'FAILED';
            finalize(record);
        })
    }).catch(error => {
        console.trace(error);
        record.error = error;
        record.status = 'FAILED';
        finalize(record);
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

function clone(data){
    return JSON.parse(JSON.stringify(data));
}