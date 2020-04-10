import { resolve } from 'path';
import { copy, createWriteStream } from 'fs-extra';
import * as archiver from 'archiver';
import * as glob from 'glob';

export class Utility {
    /**
  * @description The Zipping function with file name
  * @param {string} source Source of the files to be zipped
  * @param {string} destination Destination of the files to be zipped
  * @param {string} name name of the zip file
  */
    private zipFolder(source: string, destination: string, name: string): Promise<void> {
        destination = resolve(destination, name + '.zip');
        var archive = archiver('zip', { zlib: { level: 9 } });
        var stream = createWriteStream(destination);
        archive.directory(source, false).on('error', err => console.log('Zip Error: ', err)).pipe(stream);
        return archive.finalize();
    }

    // *********************************************************************************************************************************** //

    /**
   * Random string generator
   * @param {number} len the number of characters required in the string
   */
    private randomStringGenerator(len: number = 5): string {
        let name = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < len; i++) {
            name += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return name;
    }

    // *********************************************************************************************************************************** //

    /**
     * Copies with restriction of included file types
     * @param {string} source source location
     * @param {string} destination destination location
     * @param {string[]} includedTypes (optional) types of files to be included, or all files
     */
    private globCopyFiles(source: string, destination: string, includedTypes?: string[]): Promise<any> {
        if (!includedTypes)
            includedTypes = ['*']
        return Promise.all(includedTypes.map(type => Utility.glob(source, ('**/*.' + type))))
            .then(filesArray => {
                let fileList = [];
                for (let files of filesArray)
                    fileList = fileList.concat(files)
                return fileList;
            })
            .then(data => {
                return Promise.all(data.map(file => copy(resolve(source, file), resolve(destination, file), { overwrite: true })))
            });
    }

    // *********************************************************************************************************************************** //

    /**
     * Glob function to find paths recursively based on wild cards
     * @param baseDir base directory
     * @param filePath path to the file
     */
    public static glob(baseDir: string, filePath: string): Promise<string[]> {
        return new Promise((resolve) => {
            glob(filePath, { cwd: baseDir }, (err, files: string[]) => {
                if (err) {
                    resolve([]);
                    return;
                }
                resolve(files);
            });
        });
    }
}