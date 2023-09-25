#!/usr/bin/env node

const inquirer = require('inquirer') ;
const handlebars = require('handlebars')
const fs = require('fs');
const path = require('path');

const currentDir = process.cwd();

const TEMPLATES_ROOT = path.join(currentDir, '/cli/templates');


function ensureDirectoryExistence(filePath) {
    const dirName = path.dirname(filePath);
    if (fs.existsSync(dirName)) {
        return;
    }
    ensureDirectoryExistence(dirName);
    fs.mkdirSync(dirName, { recursive: true });
}

async function getGeneratorsFromTemplates() {
    const directories = fs.readdirSync(TEMPLATES_ROOT, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const generators = {};

    for (const directory of directories) {
        const possibleConfigPaths = [
            path.join(TEMPLATES_ROOT, directory, 'config.js'),
            path.join(TEMPLATES_ROOT, directory, 'config.ts'),
            path.join(TEMPLATES_ROOT, directory, 'config.json'),
        ];

        for (const configPath of possibleConfigPaths) {
            if (fs.existsSync(configPath)) {
                const configModule = await require(configPath);
                if(configModule){

                    generators[directory] = configModule;
                    break;
                }
            }
        }
    }

    return generators;
}

async function promptForGenerator() {
    const generators = await getGeneratorsFromTemplates();
    const generatorChoices = Object.keys(generators).map(key => ({
        name: `${key} - ${generators[key]?.description ?? ''}`,
        value: key,
    }));

    const { generatorChoice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'generatorChoice',
            message: 'Select a generator:',
            choices: generatorChoices,
        },
    ]);

    return generatorChoice;
}

async function executeGenerator(generatorKey) {
    const generators = await getGeneratorsFromTemplates();
    const generator = generators[generatorKey];
    const templateBasePath = path.join(TEMPLATES_ROOT,generatorKey );
    const baseUrl = generator.baseUrl || '';  // baseUrl 값을 가져오거나 없으면 빈 문자열을 사용합니다.
    const answers = await inquirer.prompt(generator.prompts);

    for (const action of generator.actions) {
        let templateContent = '';

        // append type 작업에서 template 속성에서 내용을 직접 가져옵니다.
        if (action.type === 'append' && action.template) {
            templateContent = action.template;
        } else if (action.templateFile) {
            const templatePath = path.join(templateBasePath, action.templateFile);
            templateContent = fs.readFileSync(templatePath, 'utf8');
        }

        const compiledTemplate = handlebars.compile(templateContent);

        // baseUrl을 포함하여 출력 경로를 조정합니다.
        const outputPath = path.join(currentDir, '/', baseUrl, action.path.replace(/{{name}}/g, answers.name));
        if (action.type === 'add') {
            ensureDirectoryExistence(outputPath);
            fs.writeFileSync(outputPath, compiledTemplate(answers), 'utf8');
        } else if (action.type === 'append') {
            if (fs.existsSync(outputPath)) {
                const existingContent = fs.readFileSync(outputPath, 'utf8');
                fs.writeFileSync(outputPath, `${existingContent}\n${compiledTemplate(answers)}`, 'utf8');
            } else {
                fs.writeFileSync(outputPath, compiledTemplate(answers), 'utf8');
            }
        }
    }
}

(async () => {
    const generatorChoice = await promptForGenerator();
    await executeGenerator(generatorChoice);
    console.log('Files successfully generated!');
})();
