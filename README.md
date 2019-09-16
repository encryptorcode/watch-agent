# Watch Agent using command line
A command line wrapper for monitoring, iterations and long processes

So tell me
* Have you ever thought of running a iterative process on your command line ? 
* Has it ever been simple to develop ? 
* Have you ever not procrastinated to develop such a script ?

Watch Agent is here to rescue. It makes developing any iterative process as easy as just fetching data and showing it on command line. Just go ahead and install watch-agent start creating your own agents.

## Installation
```sh
    npm i -g watch-agent
```

## Usage: 

### 1. Start an agent
```sh
    wa start <agent> [args...]
```

agent - name of the agent

args - agruments to be passed for agent to start an instance

#### Options:
* -d, --delay   [optional] Delay in seconds between each fetch call. 60 seconds delay if not specified.
* -t, --times   [optional] Number of times to execute. Infinite times if not specified.

### 2. Stop an agent
```sh
    wa stop <agent> <pid>
```

agent - name of the agent

pid - process id of the agent to be stopped

### 3. Show running agent details
```sh
    wa show <agent> [args...]
```

agent - name of the agent

args - arguments to be passed for agent to show data

## Making your own agents

**Step 1:** Create a directory and add that directory in env variable `WATCH_AGENT_REPO`. Recommended is to add this variable to .bash_profile for linux and mac systems. And system path for windows application
```sh
export WATCH_AGENT_REPO=~/watch-agent-repo
```

**Step 2:** Create sub directories inside that folder with the name of the agent prefixed with `wa-`.

**Sample directory structure**
```
.
├── common                  --> Common code required for all the agents
│   ├── http-client.js
│   └── prompt.js
├── node_modules            --> Node imports
│   └── **
├── package-lock.json
├── package.json            --> Node package.json
├── wa-agent1               --> Agent directory
│   └── index.js            --> index.js file which `watch-agent` will
├── wa-agent2                   invoke with `wa start agent1`
│   └── index.js
└── wa-agent3
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
         * This method is used to perform additional operations based on data from fetch
         */
    },
    display: (handler, args) => {
        /**
         * [Mandatory]
         * You can use the handler to get all records and use console.log to print when `wa show <agent>` command is called.
        */
    }
};
```

Once this is done. You can start using watch-agent using the commmands specified.

## Handler 
We have below given method that can be called using the handler object. 
1. `handler.getAllRecords()` - Will give you list of latest records of all instances of your agent in an array.
2. `handler.getPreviousRecord()` - Will get you only the previous record for the current agent instance.

## Record Object
Sample record object
```json
{
    "args" : ["arg1","arg2"],
    "iteration" : "4",
    "status" : "SUCCESS",
    "pid" : 2104,
    "data" : ...
}
```

1. args - arguments passed in start command.
2. iteration - index of iteration currently in progress (starts from 1)
3. status - status of the previous execution
4. pid - os process id
5. data - data returned from fetch operation