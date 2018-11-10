const FS = require('fs')

const sourceFile = process.argv[2]
const destDir = process.argv[3]

const json = JSON.parse(FS.readFileSync(sourceFile))

const entries = json.entries
console.log(`Sorting out ${entries.length} entries...`)

const db = {}

// group all entries by date
//
entries.forEach(entry => {
  let postDate = dateToYMD(entry.creationDate)

  if (db[postDate] === undefined) {
    db[postDate] = []
  }

  db[postDate].push(entry)
})

// create .md files for each day with all the posts on that date
//
Object.keys(db).forEach(key => {
  let posts = db[key]

  let date = posts[0].creationDate
  let location = posts[0].location ? posts[0].location.localityName : ''

  // header
  let contents =
`---
created_at: ${key} ${dateToHMS(date)}
location: ${location}
generator: DayOneSplitter
---

# Diary for ${dateToYMD(date)}, ${dateToDayOfWeek(date)}
`

  // post contents
  posts.forEach(post => {
    let timeString = dateToHMS(post.creationDate).split(':')
    let time = `${timeString[0]}:${timeString[1]}`

    contents +=
`
## ${time}

${post.text}
`
  })

  FS.writeFileSync(`${destDir}/${key}.md`, contents)
})

// helper functions
//
function dateNoZ (date) {
  // prevent js Date functions from doing time zone conversions of Day One's Zulu time
  let datz = date.substring(0, date.length - 1)
  return new Date(datz)
}

function dateToYMD (date) {
  let datz = dateNoZ(date)
  let d = datz.getDate()
  let m = datz.getMonth() + 1
  let y = datz.getFullYear()
  return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
}

function dateToHMS (date) {
  let datz = dateNoZ(date)
  let timeString = datz.toTimeString()
  let time = timeString.split(' ')[0]
  return time
}

function dateToDayOfWeek (date) {
  let datz = dateNoZ(date)
  let dayOfWeek = datz.getDay()
  return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
}
