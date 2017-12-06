import * as http from 'https';
import {request} from "https";
import {argv} from 'yargs';
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {delay} from "rxjs/operator/delay";
import {pipeFromArray} from "rxjs/util/pipe";
import {map} from "rxjs/operator/map";
import {from} from "rxjs/observable/from";
import {RequestOptions} from "https";
import {ServerOptions} from "https";


console.log("---start----")

const username:string = argv.username;
const password:string = argv.password;
const newVersion:string = argv.newVersion;
const importIfNeeded:boolean = (argv.importIfNeeded === 'true');

console.log("- user name:"+username);
console.log("- password:"+password);
//
// // node  uDeployHelper_version_typescript.js --username='admin' --password='pass' --newVersion='1.1' --importIfNeeded=true
//

if(!username || !password || !newVersion) {
    throw new Error('missing input arguments ');
}

class uDeployComponent {
    constructor(private name:string, private id:string, private version?:string){};
}

function* genComponentList() {
    yield new uDeployComponent('component1','aaaa-bbbb-gggg-eeee-uuess3322ds93');
    yield new uDeployComponent('component2','ooosss999ss-bd1c-4d73-a3a7-baa1e4201dd4');
}

function observableFromIterable<T>(iterable: Iterable<T>): Observable<T> {
    return from(iterable as any)
}

const compoents = genComponentList();
observableFromIterable(compoents).forEach(x => checkLatestVersion(x));



const retriveVersionPath1 = '/rest/deploy/version?rowsPerPage=10&pageNumber=1&orderField=dateCreated&sortType=desc&filterFields=component.id&filterFields=active&filterValue_component.id=' ;
const retriveVersionPath2 = '&filterType_component.id=eq&filterClass_component.id=UUID&filterValue_active=true&filterType_active=eq&filterClass_active=Boolean&outputType=BASIC&outputType=LINKED';
const importVersionPayload = `{"properties":{"version":"${newVersion}"}}`;
const Authorization = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
const uDeployHost = 'udeploy.xxxx.yourdomain.com';
let optionsget = {
    host : uDeployHost,
    port : 443,
    headers: {
        'Authorization': Authorization
    } ,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false,
    path : '',
    method: ''
};

let counter = 0;

console.log("============= Let's go ===============");


function checkLatestVersion(component) {
    console.log('checking component: ' + component.name);
    
    optionsget.path = retriveVersionPath1 + component.id + retriveVersionPath2;
    optionsget.method = 'GET';

    let streamData :any[];
    let body : string;
    let op = {
        url : uDeployHost,
        port : 443,
        headers: {
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        } ,
        rejectUnauthorized: false,
        requestCert: true,
        agent: false,
        path : retriveVersionPath1 + component.id + retriveVersionPath2,
        method: 'GET'

    };

    let reqGet = request(op, function(res) {

        res.on('data', (chunk) => {
            streamData.push(chunk);
        }).on('end', ()=>{
            body = Buffer.concat(streamData).toString();
            let json = JSON.parse(body);
            if(json && json.length>0) {
                if(json[0].name !== newVersion) {
                    console.log('== Component ' + json[0].component.name +' is NOT the latest version, its version is:=========='+json[0].name+'\n');
                    if(importIfNeeded) {
                        console.log(' going to import version');
                        importVersion(component);
                    }
                } else {
                    console.log('Component '+ json[0].component.name  + ' is in latest version');
                }
            }
            counter++;
        }).on('error', function(e) {
            console.error("===========ERROR!!!=========:", e);
        });

    });
    reqGet.end();
}

function importVersion(comp) {
    optionsget.path = `/rest/deploy/component/${comp.id}/integrate`; 
    optionsget.method = 'PUT';
    let reqPut = http.request(optionsget, function(res) {
        res.on('data', function(chunk) {
            console.info("====== info :"+chunk);
        });
    });

    reqPut.write(importVersionPayload);
    reqPut.end();
    reqPut.on('error', function(e) {
        console.error("====error:"+e);
    });

    setTimeout(function() { console.log('sleeping ....')}, 3000);

}
