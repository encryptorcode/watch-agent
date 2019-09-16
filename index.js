#!/usr/bin/env node

const commander = require('commander'),
    chalk = require('chalk'),
    main = require('./src/main'),
    packageJson = require('./package.json');

if(!process.env.WATCH_AGENT_REPO){
    console.log(chalk.red('\u274c You have not setup env ' + chalk.bold('$WATCH_AGENT_REPO') + ' yet. Please set that up first.'));
    return;
}

commander
    .command('start <agent> [args...]')
    .description('Starts an agent instance with the given arguments.')
    .option('-d, --delay <delay>', '[optional] Delay in seconds between each fetch call. 60 seconds delay if not specified.')
    .option('-t, --times <times>', '[optional] Number of times to execute. Infinite times if not specified.')
    .action((agentName, args, command) => {
        main.start(agentName, command.delay, command.times, args);
    });

commander
    .command('stop <agent> [pid]')
    .description('Stops a running agent instance of the given pid.')
    .action((agentName, pid) => {
        if(pid){
            main.stop(agentName, pid);
        } else {
            main.stopAll(agentName);
        }
    })

commander
    .command('show <agent> [args...]')
    .description('Shows the details of currently running agent instances.')
    .action((agentName, args) => {
        main.show(agentName, args);
    })

commander
    .on('command:*', () => {
        console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
    });

commander.version(packageJson.version, '-v, --version')
commander.parse(process.argv);