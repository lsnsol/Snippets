const fse = require('fs-extra')

let fileName = (process.argv[2]) ? process.argv[2] : 'data'
let fileData = fse.readFileSync(fileName + '.txt', 'utf8')


let fileDataArray = fileData.split('\r\n')
let monthlyTotal = []
let totalsum = 0
let yeartotal = 0
let month = parseInt(fileData.split('\n')[0].split(':')[0].split('/')[1])
let year = parseInt(fileData.split('\n')[0].split(':')[0].split('/')[2])

for (let i of fileDataArray) {
    let sum = 0
    if (i.match('/') < 2) {
        yeartotal = yeartotal + totalsum
        totalsum = 0
        monthlyTotal.push(i)
        continue
    }
    if (i.match(':') > 1) {
        sum = parseFloat(i.split(' : ')[2].replace(',', ''))
        totalsum = totalsum + sum
        monthlyTotal.push(i)
        continue
    }
    // console.log(i)
    loc = i.split(' : ')[1]
    if ((loc.split(' + ')).length > 1 && loc.split(' + ')[0] != '') {
        for (let j of loc.split(' + '))
            sum = sum + parseFloat(j.replace(',', ''))
        formated = (sum + '').replace('.00', '')
        monthlyTotal.push(i + ' : ' + formated)
        totalsum = totalsum + sum
    } else if (loc.split(' + ')[0] != '') {
        monthlyTotal.push(i + ' : ' + loc.split(' + ')[0])
        totalsum = totalsum + parseFloat(loc.split(' + ')[0].replace(',', ''))
    } else
        monthlyTotal.push(i)

    yeartotal = (yeartotal + totalsum + '').replace('.00', '')
}

formated = (totalsum + '').replace('.00', '')
monthlyTotal.push('\n------------------------ ' + formated + ' : ' + formated + ' -------------------------\n')

newMonth = []
end = 31
year = (month == 12) ? year + 1 : year
month = (month < 12) ? month + 1 : 1

if ([1, 3, 5, 7, 8, 10, 12].includes(month))
    end = 32
else if (month == 2)
    end = 29
for (let i = 1; i < end; i++)
    newMonth.push(i + '/' + month + '/' + year + ' : ')
    
newMonth.push('\n------------------------  :  -------------------------')

console.log(totalsum)
fse.writeFileSync('m.total.txt', monthlyTotal.join('\n'))
fse.writeFileSync('nm.txt', newMonth.join('\n'))
