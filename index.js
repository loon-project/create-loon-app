#!/usr/bin/env node

const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const spawn = require('child_process').spawn;
const os = require('os');

program  
  .version(pkg.version, '-v, --version')
  .arguments('<appName>')
  .description('creates a new loon application with default structure and a hello world controller')
  .option('-s, --server', 'server type, support express and fastify, default is fastify')
  // .option('-t, --template', 'support custom template')
  .action((appName, cmd) => {
    verifyType(cmd.server);
    createApp(appName, cmd);
  });

function verifyType(type) {
  if (type && ['express', 'fastify'].indexOf(type) === -1) {
    console.error(`only support type express or fastify`);
    process.exit(1);
  }
}

async function createApp(name, cmd) {
  const root = path.resolve(name);

  await initPackageJson(root, name);
  await install(root, 'loon');
  await install(root, 'nodemon', 'devDependencies');
  await install(root, 'ts-node', 'devDependencies');
  await install(root, 'typescript', 'devDependencies');
  await copyTemplates(root);
  await changeServerType(root, cmd.server);

  process.chdir(root);
  console.log('create loon app done, happy coding!');
}

async function initPackageJson(root, name) {
  const packageJson = {
    name,
    version: '0.1.0',
    private: true,
    scripts: {
      "start": "EXT=ts nodemon -e ts -w src --exec 'node --inspect -r ts-node/register' src/App.ts"
    }
  };

  fs.ensureDirSync(root);

  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
}

function install(root, dependency, mode = 'dependencies') {

  return new Promise((resolve, reject) => {
    const command = 'npm';
    const args = [
      'install',
      mode === 'devDependencies' ? '--save-dev' : '--save',
      '--save-exact'
    ].concat(dependency);


    const child = spawn(command, args, { stdio: 'inherit', cwd: root });

    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
      }
      resolve();
    });
  });
}

async function copyTemplates(root) {
  const templatePath = path.join(__dirname, 'templates');
  await fs.copy(templatePath, root)
}

async function changeServerType(root, type) {
  if (typeof type === 'undefined') {
    type = 'fastify';
  }
  const appFilePath = path.join(root, 'src', 'App.ts');
  const file = await fs.readFile(appFilePath);
  const newAppFile = file.toString().replace('<SERVER>', type);
  await fs.writeFile(appFilePath, newAppFile);
}


program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp()
}


