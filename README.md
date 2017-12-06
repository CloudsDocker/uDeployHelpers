# uDeployHelpers
helpers to automate uDeploy operations

There are two versions, one is in nodejs another version is in typescript

## Node JS
Run it with following script
```bash
node uDeployHelper_version_node.js --username='admin' --password='pass' --newVersion='1.1' --importIfNeeded=true
```
## Type script
Firslty transpile it to javascript
```bash
tsc uDeployHelper_version_typescript.ts
```

Then run it 
```bash
node  uDeployHelper_version_typescript.js --username='admin' --password='pass' --newVersion='1.1' --importIfNeeded=true
```
