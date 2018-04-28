const fs = require('fs')
const path = require('path')
const readline = require('readline')

const argv = require('yargs').argv
const sanitize = require('sanitize-filename')

const defaultConfigBasename = 'config.json'
const videoExts = ['.avi', '.mkv', '.mov', '.mp4']
const sampleConfigJson = {
    "series-name": "Fringe",
    "1": "Olivia",
    "2": "The Box",
    "3": "The Plateau",
    "4": "Do Shapeshifters Dream of Electric Sheep",
    "5": "Amber 31422",
    "6": "6955 kHz",
    "7": "The Abducted",
    "8": "Entrada",
    "9": "Marionette",
    "10": "The Firefly",
    "11": "Reciprocity",
    "12": "Concentrate and Ask Again",
    "13": "Immortality",
    "14": "6B",
    "15": "Subject 13",
    "16": "Os",
    "17": "Stowaway",
    "18": "Bloodline",
    "19": "Lysergic Acid Diethylamide",
    "20": "06:02 AM EST",
    "21": "The Last Sam Weiss",
    "22": "The Day We Died"
}

const log = console.log

// get input args
const workingDir = argv._[0]

// show help if asked for
if (argv.h) {
    log('usage: node server.js [options] targetdir [configfilepath]\n\
    -h : this help screen\n\
    --init, -i : create sample config file in target dir')
    process.exit(0)
}

// verify target dir arg was supplied
if (!workingDir) {
    log('FAIL: missing required arg 1 (path video files).\n\
    OPT: Use -h to view help.')
    process.exit(0)
}

// create initial config file at target dir if asked for
if (argv.init || argv.i) {
    const configFilepath = path.resolve(workingDir, defaultConfigBasename)
	fs.writeFileSync(configFilepath, JSON.stringify(sampleConfigJson, null, '  '))
	log(`SUCCESS: created ${configFilepath}`)
	process.exit(0)
}

// read config file that contains episode list
const configFilepath = argv._[1]
    ? argv._[1]
    : path.resolve(workingDir, defaultConfigBasename)

var configFile
try {
    configFile = JSON.parse(fs.readFileSync(configFilepath))
} catch (e) {
    log('FAIL: error parsing config file', e)
    process.exit(0)
}

// get paths for video files list from the working directory
const videoFilepaths = fs.readdirSync(workingDir)
    .filter(filepath => videoExts.includes(path.extname(filepath)))
    .map(filepath => path.resolve(workingDir, filepath))

// create a list of objects containing old and new paths
const twoByteString = num => (num / 100).toFixed(2).toString().slice(2)

const composeNewFilepath = (lkup, oldFilepath) => {
    const episodeId = oldFilepath.match(/s\d+e\d+/i)[0]
    const seasonNum = Number.parseInt(episodeId.match(/^s\d+/i)[0].match(/\d+/)[0])
    const episodeNum = Number.parseInt(episodeId.match(/e\d+$/i)[0].match(/\d+/)[0])
    const title = lkup[episodeNum]
    const ext = path.extname(oldFilepath)
    const seriesName = lkup['series-name']
    const newBasename = sanitize(`${seriesName}_S${twoByteString(seasonNum)}E${twoByteString(episodeNum)}_${title}${ext}`)
    return path.resolve(path.dirname(oldFilepath), newBasename)
  }

const oldAndNewFilepaths = videoFilepaths.map(filepath => ({
    old: filepath,
    new: composeNewFilepath(configFile, filepath)
}))

// show user the list of files to be renamed
log(
    'the following files will be renamed:\n',
    oldAndNewFilepaths.map(x => `${path.basename(x.old)} -> ${path.basename(x.new)}`)
)

// confirm w/ user if ok to rename
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question('\nproceed [y|n]? $ ', answer => {
	if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' ) {
        log('Renaming...')
        oldAndNewFilepaths.map(o => fs.renameSync(o.old, o.new))
		log('...Done!')
	} else {
		log('Skipped renaming.')
	}  
	
    log('Bye!')
    process.exit(0)
})
