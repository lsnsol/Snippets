var fs = require('fs-extra')
let arr = ['c.e.f', 'c.e', 'a.b', 'c.d', 'c.e.g', 'a.b.s', 'p.q.r.s', 'p.e.r.s', 'x.y.z']
// let arr = ['a.b.c', 'x.z', 'x.y', 'x.y.l', 'm', 'm.n']
let finalResult = []
arr.sort()

var keyToJson = function (finalResult, child) {
    let index = child.indexOf('.')
    if (index < 0)
        index = 1
    let label = child.substring(0, index)
    let subchild = child.substring(index + 1)
    let jsonResult = {}
    let flag = true
    if (finalResult.length)
        finalResult.forEach(element => {
            if (element && element.label == label) {
                jsonResult = element
                flag = false
            }
        });
    if (flag) {
        jsonResult['label'] = label
        jsonResult['children'] = []
    }

    if (subchild.split('.').length > 1) {
        let res
        if (finalResult.indexOf(jsonResult) > -1)
            res = keyToJson(finalResult[finalResult.indexOf(jsonResult)].children, subchild)
        else
            res = keyToJson(jsonResult.children, subchild)
        if (res)
            jsonResult['children'].push(res)
        if (flag)
            return jsonResult
        else
            return null
    } else {
        if (subchild != '')
            jsonResult['children'].push({ label: subchild, children: [] })
        if (flag)
            return jsonResult
        else
            return null
    }
}

arr.forEach(element => {
    result = keyToJson(finalResult, element)
    if (result) {
        finalResult.push(result)
    }
})

fs.writeFileSync('./result.json', JSON.stringify(finalResult))