const path = require('path')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const fs = require('fs-extra')
const archiver = require('archiver');

/**
 * @description Find the list of changed modules and the most recent tag for a given version based on tags/commit messages
 * @param {String} matchString : The string to be matched in the commit message
 * @param {String} repoPathCommand : cd <path to repo>
*/
var moduleListFromTagString = function (matchString, repoPathCommand, callback) {
    const changeFindCommand = repoPathCommand + ' && git log --tags --name-only --oneline --grep="' + matchString + '"'
    const latestTagFindCommand = repoPathCommand + ' && git describe --match "' + matchString + '*"'
    exec(changeFindCommand, function (err, out) {
        if (err)
            callback(err)
        else {
            let comments = out.split('\n');
            let moduleList = [];
            for (let i = 1; i < comments.length; i++)
                if (comments[i].split('/')[1] === 'app') {
                    // console.log(comments[i])
                    let moduleName = comments[i].split('/')[2]
                    if (Object.keys(config.dependencies).includes(moduleName)) {
                        moduleList = moduleList.concat(config.dependencies[moduleName])
                    }
                    moduleList.push(moduleName);
                }
            let setModuleList = new Set(moduleList);
            moduleList = []
            setModuleList.forEach(moduleName => moduleList.push(moduleName));
            exec(latestTagFindCommand, function (err, out) {
                if (!err) {
                    let mostRecentTag = out.split('-')[0]
                    callback(null, moduleList, mostRecentTag)
                } else
                    callback(err)
            })
        }
    })
}

// *********************************************************************************************************************************** //

/**
 * @description Find the list of changed modules for a given version based on commitIds
 * @param {Array<string>} commitIdArray : Array of commitIds which needs to be considered for a particular OTA release
 * @param {String} latestCommitId : The latest commitId which is to point to the latest version of code for a particular release
 */
var findModuleListFromCommitId = function (commitIdArray, latestCommitId) {
    let moduleList = [];
    for (let commitId of commitIdArray) {
        let out = execSync(findByCommitIdCommand + commitId) + ''
        let comments = out.split('\n');
        for (let i = 1; i < comments.length; i++)
            // if condition for selecting the module names form the list of changed files based on commit ids, to be adjusted w.r.t project
            if ((comments[i].split('/')[1] === 'app' || comments[i].split('/')[1] === 'apps') && comments[i].split('/').length > 3) {
                let moduleName = comments[i].split('/')[2].replace('+', '')
                if (Object.keys(config.dependencies).includes(moduleName)) {
                    moduleList = moduleList.concat(config.dependencies[moduleName])
                }
                moduleList.push(moduleName);
            }
    }
    let setModuleList = new Set(moduleList);
    moduleList = []
    setModuleList.forEach(moduleName => moduleList.push(moduleName));
    if (latestCommitId)
        execSync(latestCheckoutCommand + latestCommitId)
    return (moduleList)
}

// *********************************************************************************************************************************** //

/**
 * @description Checkout the latest version of a branch from remote to local
 * @param checkoutFolder path to the folder to checout repo
 * @param branch branch name to checkout
 * @param repoUrl url to the repo
 */
var checkoutRepo = function (checkoutFolder, branch, repoUrl, callback) {
    const cloneCommand = 'git clone --single-branch --branch ' + branch + ' ' + repoUrl + ' ' + checkoutFolder
    const resetToLastCommitCommand = 'git reset --hard'
    if (!fs.existsSync(checkoutFolder))
        fs.mkdirSync(checkoutFolder)
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
        exec([cloneCommand, repoPathCommand, resetToLastCommitCommand].join(' && '), function (err) {
            if (err)
                callback(err)
            else {
                console.log("Getting Repo Ready !!")
                fs.appendFileSync(path.join(repoPath, '.npmrc'), npmrcData);
                if (!fs.existsSync(path.join(repoPath, 'node_modules')))
                    exec([repoPathCommand, installCommand].join(' && '), function (err) {
                        if (err)
                            callback(err)
                        else
                            callback(null)
                    })
                else {
                    console.log("\tMessage: Node Modules Exists\n")
                    callback(null)
                }
            }
        })
    } else {
        console.log("\tMessage: Repository Exists\n")
        callback(null)
    }
}

// *********************************************************************************************************************************** //

/** 
 * @description Checkout a particular tag based commit to local
 * @param repoFolder path to the repo in local
 * @param tagName tagname to checkout
 */
var checkoutBasedOnTag = function (repoFolder, tagName, callback) {
    const tagBasedCheckoutCommand = repoFolder + ' && git checkout tags/' + tagName
    exec(tagBasedCheckoutCommand, function (err) {
        if (err)
            callback(err)
        else
            callback(null)
    })
}

// *********************************************************************************************************************************** //

/**
 * @description Copy Selected files from source to destination
 * @param {Array<string>} : List of modules to be copied after the bulld process
 */
var copySelectedFiles = function (source, destination, filesList, callback) {
    let builtFiles = fs.readdirSync(source)
    fs.emptyDirSync(destination)
    builtFiles.forEach(builtFile => {
        if (filesList.includes(builtFile.split('.')[0])) {
            fs.copyFileSync(path.join(source, builtFile), path.join(destination, builtFile))
        }
    })
    callback(null)
}

// *********************************************************************************************************************************** //

/**
 * @description The Zipping function
 * @param {string} source : Source of the folder to be zipped
 * @param {string} destination : Destination of the zip file to be created
 * @param {string} name : Name of the zip file
 */
var zipFolder = function (source, destination, name, callback) {
    let archive = archiver('zip', { zlib: { level: 9 } });
    let stream = fs.createWriteStream(path.join(destination, name + '.zip'));
    archive.directory(source, false).on('error', function (err) { callback(err) }).pipe(stream)
    archive.finalize()
    stream.on('close', function () { fs.removeSync(tempZipFolder), callback(null) })
}

// *********************************************************************************************************************************** //

/**
 * @description The Zip Builder function
 * @param {string} source : Source of the file to be zipped
 * @param {string} destination : Destination of the zip file to be created
 * @param {string} zipName : Name of the zip file to be created
 * @param {Array<string>} excludeList : List of files to be excluded
 * @param {Array<string>} includeList : List of files to be included
 */
var partialFileZip = function (source, destination, zipName, excludeList, includeList, callback) {
    if (!fs.existsSync(destination)) fs.mkdirSync(destination)
    if (fs.existsSync(tempZipFolder)) fs.removeSync(tempZipFolder)
    fs.mkdirSync(tempZipFolder)
    try {
        let sourceFiles = fs.readdirSync(source);
        sourceFiles = Array.from(new Set(
            sourceFiles.filter(e => !excludeList.includes(e))
                .concat(includeList)
        ));
        sourceFiles.forEach(function (file) {
            fs.copyFileSync(path.join(source, file), path.join(tempZipFolder, file))
        })
        zipFolder(tempZipFolder, destination, zipName, function (err) { callback(err) })
    }
    catch (err) {
        console.log(err)
    }
}

// *********************************************************************************************************************************** //

/**
 * @description find max element subset in which each element is less than equal to the diff provided
 * @param arr {Array<number>} Input array
 * @param diff {number} The max diff between elements of the subset
 */
numberArr = function (arr, diff) {
    let result = [];
    let temp = [];
    arr = arr.sort();
    for (let i = 0; i < arr.length; i++) {
        temp.push(arr[i]);
        for (let j = 0; j < arr.length, j != i; j++)
            if (Math.abs(arr[i] - arr[j]) <= diff)
                temp.push(arr[j]);

        if (temp.length >= result.length)
            result = temp.slice();
        temp = [];
    }
    return result.length;
}

// console.log(numberArr([4, 6, 5, 3, 3, 1], 1))
// console.log(numberArr([1, 2, 2, 3, 1, 2], 1))

// *********************************************************************************************************************************** //

/**
 * @description Remove repeating chars recursively
 * @param s {string} The string
 * @param k {number} The number of the characters to match
 */
removeChars = function (s, k) {
    for (let i = 0; i < s.length; i++) {
        let rm = s[i].repeat(k)
        if (s.includes(rm)) {
            s = s.replace(rm, '')
            i = 0
        }
    }
    return s
}

// console.log(removeChars('aabbbac', 2))
// console.log(removeChars('aabbbac', 5))

// *********************************************************************************************************************************** //
