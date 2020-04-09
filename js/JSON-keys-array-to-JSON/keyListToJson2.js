var fs = require("fs-extra");
var fieldsTree = [];
var inputFields = ['c.e.f']//, 'c.e', 'a.b', 'c.d', 'c.e.g', 'a.b.s', 'p.q.r.s', 'p.e.r.s', 'x.y.z'];
// var inputFields = ['a.b.c', 'x.z', 'x.y', 'x.y.l', 'm', 'm.n'];

function recursiveFields(data, refArray) {
    if (data.length > 1) {
        const check = refArray.find(item => item.label === data[0])
        if (check)
            recursiveFields(data.slice(1), check.children);
        // recursiveFields(data.slice(1), refArray[refArray.length - 1].children);
        else {
            refArray.push({
                label: data[0],
                children: []
            })
            recursiveFields(data.slice(1), refArray[refArray.length - 1].children);
        }
    }
    // else
    const check = refArray.find(item => item.label === data[0])
    if (!check) {
        refArray.push({
            label: data[0],
            children: []
        })
    }
}

inputFields.forEach(ele => {
    recursiveFields(ele.split("."), fieldsTree);
})

fs.writeFileSync('./result2.json', JSON.stringify(fieldsTree))