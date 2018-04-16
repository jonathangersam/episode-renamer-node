const path = require('path')
const argv = require('yargs').argv

const configFilename = 'config.json'
const videoExts = ['.avi', '.mkv', '.mov', '.mp4']
const log = console.log

const sampleConfigJson = {
    "series-name": "Fringe",
    "1": "Olivia",
    "2": "The Box",
    "3": "The Plateau",
    "4": "Shapeshifters"
  }

// get input args
const workingDir = argv._[0]

if (!workingDir) {
    log('FAIL: missing required arg 1 (path video files)')
    process.exit(1)
}

if (argv.init || argv.i) {
    const configFilepath = path.resolve(workingDir, configFilename)
	fs.writeFileSync(configFilepath, JSON.stringify(sampleConfigJson, null, '  '))
	log(`SUCCESS: created ${configFilepath}`)
	process.exit(0)
}

const configFilepath = argv._[1]
    ? argv._[1]
    : path.resolve(workingDir, configFilename)

// read config.json
const configFile = fs.readFileSync(configFilepath)

// get files list from folder
const videoFilepaths = fs.readdirSync(workingDir)
    .filter(filepath => videoExts.includes(path.extname(filepath)))
    .map(filepath => path.resolve(workingDir, filepath))

// generate tuple src and dst


// ask user if ok to procced

// 