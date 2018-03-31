const fs = require('fs')
const readline = require('readline')
const argv = require('yargs').argv
const path = require('path')
const episodesOldAndNew = require('./lib/episode-name')

const workingDir = argv._[0] || './'
const configFilepath = argv._[1] || path.resolve(workingDir, 'config.json')

const log = console.log

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

// prettyPrintTuple:: string -> [string, string] -> string
const prettyPrintTuple = (accum = '', [src, dest]) => accum + `${path.basename(src)} -> ${path.basename(dest)}\n`

// main

// 'init' switch found? create sample config.json file at the the target directory
if (argv.init) {
	fs.writeFileSync(configFilepath, JSON.stringify(episodesOldAndNew.sampleConfig, null, '  '))
	log(`created ${configFilepath}`)
	process.exit(0)
}

let episodeNamePairs 
try {
	episodeNamePairs = episodesOldAndNew(workingDir, configFilepath)
} catch (e) {
	const errMsg = e.name === 'ConfigNotFound'
		? 'Failed to read config file from disk.\nHINT: try running with "--init" to create an initial config file at target directory'
		: e.message
	
		log(errMsg, e)
		process.exit(1)
 }

log('the following files will be renamed:\n' + episodeNamePairs.reduce(prettyPrintTuple, ''))

rl.question('\nproceed [y|n]? $ ', answer => {
	if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' ) {
		log('renaming...')
		episodeNamePairs.map(([src, dest]) => { fs.renameSync(src, dest); dest })
		log('...done!')
	} else {
		log('skipped renaming.')
	}  
	
log(' \nbye!')
process.exit(0)
})
