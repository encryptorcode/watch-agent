# watch-agent using command line
Make your agents on command line.

## Installation
```sh
    npm i -g watch-agent
```

## Usage: 

### 1. Start an agent
```sh
    wa start <module> [args...]
```
#### Options:
* -d, --delay   [optional] Delay in seconds between each fetch call. 60 seconds delay if not specified.
* -t, --times   [optional] Number of times to execute. Infinite times if not specified.

### 2. Stop an agent
```sh
    wa stop <module> <pid>
```

### 3. Show running agent details
```sh
    wa show <module> [args...]
```

## Making modules

**Step 1:** Create a directory and add that directory in env variable `WATCH_AGENT_MODULES`. Recommended is to add this variable to .bash_profile for linux and mac systems. And system path for windows application
```sh
export WATCH_AGENT_MODULES=~/watch-agent-modules
```

**Step 2:** Create sub directories inside that folder with the name of the module prefixed with `wa-`.

**Sample directory structure**
```
.
├── common                  --> Common code required for all the modules
│   ├── http-client.js
│   └── prompt.js
├── node_modules            --> Node imports
│   └── **
├── package-lock.json
├── package.json            --> Node package.json
├── wa-module1              --> Module directory
│   └── index.js            --> index.js file which `watch-agent` will
├── wa-module2                  invoke with `wa start module1`
│   └── index.js
└── wa-module3
    └── index.js
```

**Step 3:** Create an `index.js` with the structure as given below.
```js
module.exports = {
    init: async (handler, args) => {
        /**
         * [Optional]
         * This method will be called only for the first time when we start an agent.
         * It can we used to prompt for additional inputs or cancel agent from starting, if already existing.
         * It should return args which will be further passed on to fetch method of each iteration.
         * If false is returned agent will not be started.
         */
        return args;
    },
    fetch: (handler, args) => {
        /** 
         * [Mandatory]
         * This method will be called for each iteration
         * You can return either a promise or an object.
         */
        return data;
    },
    infer: (handler, data) => {
        /** 
         * [Optional]
         * This method is used to preform additional operations based on data from fetch
         */
    },
    display: (records, args) => {
        /**
         * [Mandatory]
         * You will get list of records in the method. You can use console.log to print when `wa show <module>` command is called.
        */
    }
};
```

Once this is done. You can start using watch-agent using the commmands specified.