const http = require('https');
const util = require('util');
const args = require('yargs').argv;
const username = args.username;
const password = args.password;
const newVersion = args.newVersion;
const importIfNeeded = (args.importIfNeeded === 'true');

// to check current uDeploy version and import newer version from Nexus
// node uDeployHelper_version_node.js --username='admin' --password='pass' --newVersion='1.1' --importIfNeeded=true

if(!username || !password || !newVersion) {
    console.error('missing input arguments ');
    return 1;
}

const uDeployHost = 'udeploy.internal.macquarie.com';
const updateVersionPathTemp = '/rest/deploy/component/%s/integrate';
const retriveVersionPath1 = '/rest/deploy/version?rowsPerPage=10&pageNumber=1&orderField=dateCreated&sortType=desc&filterFields=component.id&filterFields=active&filterValue_component.id=' ;
const retriveVersionPath2 = '&filterType_component.id=eq&filterClass_component.id=UUID&filterValue_active=true&filterType_active=eq&filterClass_active=Boolean&outputType=BASIC&outputType=LINKED';
const importVersionPayload = util.format('{"properties":{"version":"%s"}}', newVersion);
const Authorization = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
let counter = 0;

const optionsget = {
    host : uDeployHost, 
    port : 443,
    headers: {
        'Authorization': Authorization
    } ,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false

};


const compoents = [
    {
        name: 'component1',
        id: 'aaaa-bbbb-gggg-eeee-uuess3322ds93'
    }
    ,
    {
        name: 'component2',
        id: 'ooosss999ss-bd1c-4d73-a3a7-baa1e4201dd4'
    }
];


console.log("============= Let's go ===============");

// check current version of each components
compoents.forEach(component => {
    checkLatestVersion(component)   
});

// check all done
setTimeout(()=>{
    if(counter === compoents.length) {
        console.log('============= All Done ===============, components:'+compoents.length);
        return 0;
    } else {
        console.log('.');
    }
}, 2000);



function checkLatestVersion(component) {
    console.log('checking component: ' + component.name);
    optionsget.path = retriveVersionPath1 + component.id + retriveVersionPath2;
    optionsget.method = 'GET';

    let body = [];
    let reqGet = http.request(optionsget, function(res) {

        res.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', ()=>{
            body = Buffer.concat(body).toString();
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
            console.error("===Error found:" + e);
        });

    });
    reqGet.end();
}


function importVersion(comp) {
    optionsget.path = util.format(updateVersionPathTemp, comp.id);
    optionsget.method = 'PUT';
    let reqPut = http.request(optionsget, function(res) {
        res.on('data', function(chunk) {
            console.info("====== import version response :"+chunk);
        });
    });

    reqPut.write(importVersionPayload);
    reqPut.end();
    reqPut.on('error', function(e) {
        console.error("====error found:" + e);
    });

    setTimeout(function() { console.log('sleeping ....')}, 3000);

}



