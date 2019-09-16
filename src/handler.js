const common = require('./common');

module.exports = (agentName, pid) => {
    return {
        getPreviousRecord: () => {
            let record = common.getRecord(agentName, pid);
            return record.status == 'STARTED' ? undefined : clone(record);
        },
        getAllRecords: () => {
            let allRecords = common.getAllRecords(agentName);
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