import envPaths from 'env-paths';
import path from 'node:path';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

const paths = envPaths('slp-rec', { suffix: '' });
const configPath = path.join(paths.config, 'config.json');

const optionDefinitions = [
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide.'
    },
    {
        name: 'start-frame',
        alias: 's',
        type: Number,
        description: 'First frame to begin recording',
        typeLabel: '<frame>',
        defaultValue: 0,
    },
    {
        name: 'total-frames',
        alias: 't',
        type: Number,
        description: 'Total frames to record (default all remaining)',
        typeLabel: '<frames>',
    },
    {
        name: 'quality',
        alias: 'q',
        type: String,
        description: 'Quality preset to use for recording',
        typeLabel: '<qual>',
    },
    {
        name: 'output',
        alias: 'o',
        type: String,
        description: 'The output mp4 filename',
        typeLabel: '<mp4>',
        defaultValue: 'output.mp4',
    },
    {
        name: 'input',
        alias: 'i',
        type: String,
        description: 'The slp file to record',
        typeLabel: '<slp>',
        defaultOption: true,
    },
]

const options = commandLineArgs(optionDefinitions);
if (options.help) {
    const usage = commandLineUsage([
        {
            header: 'Usage:',
            content: 'slp-rec [OPT]* <slp>'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        },
        {
            content: 'Project home: {underline https://github.com/mitchdzugan/slp-rec}'
        }
    ]);
    console.log(usage);
    process.exit(0);
}

console.log(options);
