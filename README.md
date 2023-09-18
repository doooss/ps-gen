# sample-cli

Personal CLI Template Tool Like @turbo/gen

## How to use

1. install package (Dev recommand)

```zsh
    npm i -D ps-gen
```

2. Please add ps-gen to the scripts in package.json as follows:

```json

    "scripts":{
        "gen" : "ps-gen"
    }

```

3. Please write the following in &lt;project-root&gt;/cli/template/&lt;template-name&gt;/config.json:

> ex. root/cli/template/hooks/config.json

```json
{
    "description": "keeping the naming convention (ex use + PascalCase)", 
    "prompts": [
        {
            "type": "input",
            "name": "name",
            "message": "What is the name of the hook?"
        }
    ],
    "baseUrl": "src/hooks",
    "actions": [
        {
            "type": "add",
            "path": "{{name}}/{{name}}.test.ts",
            "templateFile": "test.hbs"
        },
        {
            "type": "add",
            "path": "{{name}}/index.ts",       
            "templateFile": "export.hbs"
        },
        {
            "type": "add",
            "path": "{{name}}/{{name}}.ts",
            "templateFile": "hook.hbs"
        },
        {
            "type": "append", 
            "path": "index.ts",
            "template": "export { default as {{ name }} } from \"./{{ name }}\""
        }
    ]
}   


```

4. In the folder where config.json is located, please create the desired template using the .hbs
