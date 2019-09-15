const common = require('./common');

module.exports = (moduleName, pid) => {
    return {
        getPreviousRecord: () => {
            let record = common.getRecord(moduleName, pid);
            return record.status == 'INITIATED' ? undefined : clone(record);
        },
        getAllRecords: () => {
            let allRecords = common.getAllRecords(moduleName);
            let displayRecords = [];
            Object.values(allRecords).forEach(record => {
                if (record.status == 'SUCCESS' || record.status == 'FAILED') {
                    displayRecords.push(record);
                }
            })
            return displayRecords;
        }
    }
}

function clone(data) {
    return JSON.parse(JSON.stringify(data));
}