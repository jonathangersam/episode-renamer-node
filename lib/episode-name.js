const fs = require('fs')
const path = require('path')
const sanitize = require('sanitize-filename')

const videoExts = ['.avi', '.mkv', '.mov', '.mp4']

const sampleConfigJson = {
  "series-name": "Fringe",
  "1": "Olivia",
  "2": "The Box",
  "3": "The Plateau",
  "4": "Shapeshifters"
}

// twoByteString:: number -> string
const twoByteString = num => (num / 100).toFixed(2).toString().slice(2)

// newBasename:: (string -> string) -> string -> string
const newBasename = (lookupFn, basename) => {
  const episodeId = basename.match(/s\d+e\d+/i)
  const seasonNum = Number.parseInt(episodeId.match(/^s\d+/i).match(/\d+/))
  const episodeNum = Number.parseInt(episodeId.match(/e\d+$/i).match(/\d+/))
  const title = lookupFn(episodeNum)
  const ext = path.extname(basename)
  const seriesName = lookupFn('series-name')
  return sanitize(`${seriesName}_S${twoByteString(seasonNum)}E${twoByteString(episodeNum)}_${title}${ext}`)
}

// zip:: [a] -> [b] -> [[a,b]]
const zip = (as, bs) => as.map((a, i) => [a, bs[i]]) // use Ramda

// rename:: [string, string] -> string
const renameSync = ([src, dest]) => {
  fs.renameSync(src, dest);
  dest
}

// TODO move to main
const getConfigDataLookup = path => {
  try {
    const configData = JSON.parse(fs.readFileSync(path))
    return key => configData[key.toString()]
  } catch (e) {
    throw new Error(`Failed to load config file from ${path}`)
  }
}

// genEpisodeNames:: string -> string -> string

// TODO: change to return [{src, dst}}]
const genEpisodeNames = (inputDir = './', configPath = './config.json', opt = {}) => {

  // get video filenames
  const srcPaths = fs.readdirSync(inputDir)
    .filter(srcPath => videoExts.includes(path.extname(srcPath)))
    .map(srcPath => path.resolve(inputDir, srcPath))

  if (srcPaths.length === 0) {
    throw new Error(`No video files in ${inputDir}`)
  }

  // load config data to lookup episode names
  const configDataLookup = lkup(getConfigDataLookup(configPath)) // TODO: move to mainline module

  // get new filenames from (old filenames + lookup)
  const destPaths = srcPaths
    .map(srcPath => newBasename(configDataLookup, srcPath))
    .map(basename => path.resolve(inputDir, basename))

  // actually change the names and return as a pair
  if (opt.rename) {
    zip(srcPaths, destPaths).map(renameSync)
  }

  return pairs
}

const api = genEpisodeNames
api.sampleConfig = sampleConfigJson

module.exports = api

