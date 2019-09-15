#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');
const main = require('./src/main');

if(!process.env.WATCH_AGENT_MODULES){
    console.log(chalk.red('\u274c You have not setup env '+ chalk.bold('$WATCH_AGENT_MODULES') + ' yet. Please set that up first.'));
    return;
}

commander
    .command('start <module> [args...]')
    .option('-d, --delay <delay>', '[optional] Delay in seconds between each fetch call. 60 seconds delay if not specified.')
    .option('-t, --times <times>', '[optional] Number of times to execute. Infinite times if not specified.')
    .option('-h, --help', 'shows help about init command.')
    .action((moduleName, args, command) => {
        main.init(moduleName, command.delay, command.times, args);
    });
commander
    .command('stop <module> [pid]')
    .action((moduleName, pid) => {
        if(pid){
            main.destroy(moduleName, pid);
        } else {
            main.destroyAll(moduleName);
        }
    })
commander
    .command('show <module> [args...]')
    .action((moduleName, args) => {
        main.show(moduleName, args);
    })
commander.parse(process.argv);