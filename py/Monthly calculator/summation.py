fileData = ''
fileName = input('File name: ') or 'data'
with open(fileName + '.txt', 'r') as myfile:
    fileData = ''.join(myfile.readlines())

fileDataArray = fileData.split('\n')
monthlyTotal = []
totalsum = 0
yeartotal = 0
month = int(fileData.split('\n')[0].split(':')[0].split('/')[1])
year = int(fileData.split('\n')[0].split(':')[0].split('/')[2])
for i in fileDataArray:
    summ = 0
    if(i.count('/') < 2):
        yeartotal = yeartotal + totalsum
        totalsum = 0
        monthlyTotal.append(i)
        continue
    if(i.count(':') > 1):
        summ = float(i.split(' : ')[2].replace(',', ''))
        totalsum = totalsum + summ
        monthlyTotal.append(i)
        continue
    # print(i)
    loc = i.split(' : ')[1]
    if(len(loc.split(' + ')) > 1 and loc.split(' + ')[0] != ''):
        for j in loc.split(' + '):
            summ = summ + float(j.replace(',', ''))
        formated = '{:,.2f}'.format(summ).replace('.00', '')
        monthlyTotal.append(i + ' : ' + formated)
        totalsum = totalsum + summ
    elif(loc.split(' + ')[0] != ''):
        monthlyTotal.append(i + ' : ' + loc.split(' + ')[0])
        totalsum = totalsum + float(loc.split(' + ')[0].replace(',', ''))
    else:
        monthlyTotal.append(i)
yeartotal = '{:,.2f}'.format(yeartotal + totalsum).replace('.00', '')
formated = '{:,.2f}'.format(totalsum).replace('.00', '')
monthlyTotal.append('\n------------------------ ' + formated +
                    ' : ' + formated + ' -------------------------\n')

newMonth = []
end = 31
year = year + 1 if month == 12 else year
month = month + 1 if month < 12 else 1

if(month in [1, 3, 5, 7, 8, 10, 12]):
    end = 32
elif(month == 2):
    end = 29
for i in range(1, end):
    newMonth.append(str(i) + '/' + str(month) + '/' + str(year) + ' : ')
newMonth.append('\n------------------------  :  -------------------------')
print('\n'.join(monthlyTotal))
print('\n'.join(newMonth))
print(yeartotal)
f = open('m.total.txt', 'w')
f.write('\n'.join(monthlyTotal))
f.close()
f = open('nm.txt', 'w')
f.write('\n'.join(newMonth))
f.close()
