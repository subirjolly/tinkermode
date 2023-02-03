import { timeStamp } from 'console';
import fetch from 'node-fetch'

const formatMemoryUsage = (data) => Math.round(data / 1024 / 1024 * 100) / 100;

const mem = {
    before: formatMemoryUsage(process.memoryUsage().heapUsed),
    after: null,
    used: null
}

const printLine = (timestamp, value) => {
    console.log(`${timestamp} ${value.toFixed(4)}`)
}

const processLine = (storage, timestamp, value, lastLine=false) => {
    timestamp.setUTCMinutes(0)
    timestamp.setUTCSeconds(0)
    const newTimestamp = timestamp.toISOString().replace('.000Z', 'Z')

    if (storage.lastTimestamp === null) {
        storage.occurence = 1
        storage.lastTimestamp = newTimestamp
        storage.average = value
    }
    if (newTimestamp !== storage.lastTimestamp) {
        printLine(storage.lastTimestamp, storage.average)
        storage.occurence = 1
        storage.lastTimestamp = newTimestamp
        storage.average = value
    } else {
        storage.average = ((storage.average * storage.occurence) + value) / (storage.occurence + 1)
        storage.occurence += 1
        if (lastLine) {
            printLine(storage.lastTimestamp, storage.average)
        }
    }
}

const processChunk = (data, storage) => {
    data.forEach(d => {
        const timestamp = new Date(d[0])
        const value = parseFloat(d[1])
        processLine(storage, timestamp, value)
    })
}

const read = async body => {
	let error;
	body.on('error', err => {
		error = err;
        console.log('ERROR')
	});

    const storage = {
        lastTimestamp: null,
        average: null,
        occurence: 0
    }

    let last = ''
    let lastChar = ''
	for await (const chunk of body) {
        const chunkData = chunk.toString()
        let data = (last + lastChar + chunkData).split('\n').filter(r => r.length > 1).map(row => row.split(' ').filter(item => item !== ''))
        last = data.pop().join(' ')

        if (chunkData[chunkData.length - 1] === ' ' || chunkData[chunkData.length - 1] === '\n') {
            lastChar = chunkData[chunkData.length - 1]
        } else {
            lastChar = ''
        }

        processChunk(data, storage)
	}

    if (last !== null) {
        const lastLine = last.split(' ').filter(item => item !== '')
        const timestamp = new Date(lastLine[0])
        const value = parseFloat(lastLine[1])
    
        processLine(storage, timestamp, value, true)
    }

	return new Promise((resolve, reject) => {
        resolve(true)
	});
};


const fetchSeries = async (begin, end) => {
    const url = `https://tsserv.tinkermode.dev/data?begin=${begin}&end=${end}`
    const hourly = {}
    try {
        const response = await fetch(url)
        await read(response.body)
    } catch (err) {
        console.log(err.stack);
    }

    mem.after = formatMemoryUsage(process.memoryUsage().heapUsed)
    mem.used = mem.after - mem.before
    console.log(`Memory Used: ${mem.used}`)
}

// fetchSeries('2021-03-04T03:45:00Z', '2021-03-04T04:17:00Z')
fetchSeries('2021-03-04T03:00:00Z', '2021-03-04T11:00:00Z')
// fetchSeries('2019-03-04T03:45:00Z', '2021-03-04T04:17:00Z')
