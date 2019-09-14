# watch-agent using command line
Make your agents on command line.

## Installation
```sh
    npm i -g watch-agent
```

## Usage: 

### 1. Initialize an agent
```sh
    wa init <module> [args...]
```
#### Options:
* -d, --delay   [optional] Delay in seconds between each fetch call. 60 seconds delay if not specified.
* -t, --times   [optional] Number of times to execute. Infinite times if not specified.

### 2. Destroy an agent
```sh
    wa destroy <module> <pid>
```

### 3. Show running agents
```sh
    wa show <module> [args...]
```

## Making modules

**Step 1:** Create a directory and add that directory in env variable `WATCH_AGENT_MODULES`. Recommended is to add this variable to .bash_profile for linux and mac systems. And system path for windows application
```sh
export WATCH_AGENT_MODULES=~/watch-agent-modules
```

**Step 2:** Create sub directories inside that folder with the name of the module.

**Step 3:** Create an `index.js` with the following three methods as given below.
```js
module.exports = {
    fetch: (previousRecord, args) => {
        /** 
         * Your fetch executions here ...
         * You can return either a promise or an object.
        */
        return rawDataPromise;
    },
    infer: (previousRecord, args, rawData) => {
        /** 
         * This method is used to preform additional operations if required based on data changes...
         * If you don't have any handling just return rawData as it is.
         * You can return either a promise or an object.
        */
        return rawData;
    },
    display: (records, args) => {
        /**
         * You will get list of records in the method. You can use console.log to print when `wa show <module>` command is called.
        */
    }
};
```

Once this is done. You can start using watch-agent using the commmands specified.