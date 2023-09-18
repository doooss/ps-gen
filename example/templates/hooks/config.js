module.exports = {
    description: 'keeping the naming convention (ex use + PascalCase)',
    prompts: [
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the hook?',
        },
    ],
    baseUrl: 'src/hooks',
    actions: [
        {
            type: 'add',
            path: '{{name}}/{{name}}.test.ts',
            templateFile: 'test.hbs',
        },
        {
            type: 'add',
            path: '{{name}}/index.ts',
            templateFile: 'export.hbs',
        },
        {
            type: 'add',
            path: '{{name}}/{{name}}.ts',
            templateFile: 'hook.hbs',
        },
        {
            type: 'append',
            path: 'index.ts',
            template: "export { default as {{ name }} } from './{{ name }}'",
        },
    ],
}   