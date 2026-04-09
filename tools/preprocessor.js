/**
 * Simple preprocessor for JavaScript
 * @url https://github.com/AlexandreBrillant/yupee
 * @author Alexandre Brillant 
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

let mainFile = "main.js";
let outputFile = "test.js"
const argv = process.argv;
let addit = "";

for ( let i = 0; i < argv.length; i++ ) {
    if ( argv[ i ] == "-a" || argv[ i ] == "--add" )
        addit = argv[ i + 1 ];
    if ( argv[ i ] == "-i" || argv[ i ] == "--input" )
        mainFile = argv[ i + 1 ];
    if ( argv[ i ] == "-o" || argv[ i ] == "--output" )
        outputFile = argv[ i + 1 ];
    if ( argv[ i ] == "-h" || argv[ i ] == "--help" ) {
        console.log( "node module.js -i inputfile -a addthis -o outputfile" );
        console.log( "or" );
        console.log( "node module.js --input inputfile --add addthis --output outputfile" );
    }
}

console.log( `Processing ${mainFile}` );
addit && ( addit = "\n" + addit );

const files = {};

function processMain() {
    let mainContent = readFileSync( mainFile, 'utf8');
    const mustread = [];

    mainContent.replace( /\/\/#include\s+"([\w\.-]+)"/gi,     
        ( match, filename ) => mustread.push( filename ) );
    
    for ( const file of mustread ) {
        readFile( file );
    }

    mainContent = mainContent.replace( /\/\/#include\s+"([\w\.-]+)"/gi,
        ( match, filename ) => {
            return files[ filename ];
        }
    )
    writeFileSync( outputFile, mainContent, 'utf8');
}

function readFile( filename ) {
    const file = path.dirname( mainFile ) + "/" + filename;
    const content = readFileSync( file, 'utf8');
    files[ filename ] = content.replace( /\/\/#start(.*)\/\/#end/gs, "" );
}

processMain();
