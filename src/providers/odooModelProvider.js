const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Parse model names and fields
function getAllModelData(workspaceFolders) {
    const modelData = {}; // { 'model.name': Set(fields) }

    // More precise class detection - handles inheritance and multiple base classes
    const classRegex = /class\s+([\w_]+)\s*\(\s*([^)]*(?:models\.(?:Model|AbstractModel|TransientModel))[^)]*)\s*\):/g;
    
    // Enhanced model name regex - handles various formats and edge cases
    const modelNameRegex = /^\s*(_name|_inherit|_inherits)\s*=\s*(?:['"]([^'"]+)['"]|\[([^\]]+)\])/gm;
    
    // Improved field regex - handles multiline definitions, various field types, and edge cases
    const fieldRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*fields\.([A-Z][a-zA-Z0-9_]*)\s*\(([^)]*)\)/gm;
    
    // More comprehensive field types for validation
    const validFieldTypes = new Set([
        'Boolean', 'Integer', 'Float', 'Monetary', 'Char', 'Text', 'Html',
        'Date', 'Datetime', 'Binary', 'Image', 'Selection', 'Reference',
        'Many2one', 'One2many', 'Many2many', 'Json'
    ]);

    const walk = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (stat.isFile() && file.endsWith('.py')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    
                    // Quick check if file contains model classes
                    if (!content.includes('models.Model') && 
                        !content.includes('models.AbstractModel') && 
                        !content.includes('models.TransientModel')) {
                        continue;
                    }

                    processFile(content, fullPath);
                } catch (err) {
                    console.warn(`Failed to read ${fullPath}:`, err.message);
                }
            }
        }
    };

    const processFile = (content, filePath) => {
        // Reset regex lastIndex to avoid issues with global regexes
        classRegex.lastIndex = 0;
        
        // Find all model classes in the file
        const modelClasses = [];
        let classMatch;
        while ((classMatch = classRegex.exec(content)) !== null) {
            modelClasses.push({
                name: classMatch[1],
                startIndex: classMatch.index,
                bases: classMatch[2]
            });
        }

        if (modelClasses.length === 0) return;

        // For each model class, extract its specific model names and fields
        for (let i = 0; i < modelClasses.length; i++) {
            const currentClass = modelClasses[i];
            const nextClass = modelClasses[i + 1];
            
            // Get the content of this specific class
            const classStartIndex = currentClass.startIndex;
            const classEndIndex = nextClass ? nextClass.startIndex : content.length;
            const classContent = content.substring(classStartIndex, classEndIndex);
            
            // Extract model names for this specific class
            const modelNames = extractModelNames(classContent);
            
            // Extract fields for this specific class
            const fields = extractFields(classContent);

            // Associate fields with model names
            for (const modelName of modelNames) {
                if (!modelData[modelName]) {
                    modelData[modelName] = {};
                }
                for (const [fieldName, fieldInfo] of Object.entries(fields)) {
                    modelData[modelName][fieldName] = fieldInfo;
                }
            }
        }
    };

    const extractModelNames = (classContent) => {
        const modelNames = [];
        modelNameRegex.lastIndex = 0;
        
        let nameMatch;
        while ((nameMatch = modelNameRegex.exec(classContent)) !== null) {
            const attribute = nameMatch[1];
            const singleValue = nameMatch[2];
            const listValue = nameMatch[3];
            
            if (singleValue) {
                modelNames.push(singleValue);
            } else if (listValue && (attribute === '_inherit' || attribute === '_inherits')) {
                // Handle list format: _inherit = ['model1', 'model2']
                const listItems = listValue.match(/['"]([^'"]+)['"]/g);
                if (listItems) {
                    for (const item of listItems) {
                        const cleanItem = item.replace(/['"]/g, '');
                        if (cleanItem) modelNames.push(cleanItem);
                    }
                }
            }
        }
        
        return [...new Set(modelNames)]; // Remove duplicates
    };

const extractFields = (classContent) => {
    const fields = {}; // { fieldName: { type: 'Char', related: 'res.partner' } }
    fieldRegex.lastIndex = 0;

    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(classContent)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];

        if (!validFieldTypes.has(fieldType) || isPrivateOrSpecialMethod(fieldName) || isCommonFalsePositive(fieldName)) {
            continue;
        }

        // Initialize field entry
        fields[fieldName] = { type: fieldType, related: null };

        // Extract the line or arguments for this field definition
        const fieldLine = classContent.slice(fieldMatch.index, classContent.indexOf('\n', fieldMatch.index + 1));

        if (['Many2one', 'One2many', 'Many2many'].includes(fieldType)) {
            // Match either comodel_name= or first argument
            const comodelMatch = fieldLine.match(
                /(?:comodel_name\s*=\s*["']([^"']+)["']|fields\.\w+\s*\(\s*["']([^"']+)["'])/
            );
            
            if (comodelMatch) {
                fields[fieldName].related = comodelMatch[1] || comodelMatch[2];
            }
        }

    }

    return fields;
};

    const isPrivateOrSpecialMethod = (name) => {
        return name.startsWith('_') || 
               name === 'self' || 
               name === 'cls' ||
               name.includes('__');
    };

    const isCommonFalsePositive = (name) => {
        // Common variable names that aren't fields
        const falsePositives = new Set([
            'result', 'value', 'data', 'record', 'records', 'model',
            'field', 'fields', 'domain', 'context', 'args', 'kwargs'
        ]);
        return falsePositives.has(name);
    };

    // Process all workspace folders
    for (const folder of workspaceFolders) {
        walk(folder.uri.fsPath);
    }

    // Convert Sets to Arrays and sort for consistent output
    const result = {};
    for (const [modelName, fieldsSet] of Object.entries(modelData)) {
        result[modelName] = Object.fromEntries(
            Object.entries(fieldsSet).sort(([a], [b]) => a.localeCompare(b))
        );
    }

    return result;
}


function registerModelProviders(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    let modelDataCache = getAllModelData(workspaceFolders);
    let modelNamesCache = Object.keys(modelDataCache);

    // Python: model names for _inherit or env[...] 
    const ModelProvider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(document, position) {
                const line = document.lineAt(position);
                const textBefore = line.text.substring(0, position.character);

                const inheritContextRegex = /_inherit\s*=\s*(\[.*)?['"]?[^'"]*$/;
                const envContextRegex = /env\[\s*['"]?[^'"]*$/;
                const fieldModelRegex = /fields\.(Many2one|One2many|Many2many)\(\s*['"]?[^'"]*$/;
                const comodelNameRegex = /comodel_name\s*=\s*['"]?[^'"]*$/;

                if (
                    !inheritContextRegex.test(textBefore) &&
                    !envContextRegex.test(textBefore) &&
                    !fieldModelRegex.test(textBefore) &&
                    !comodelNameRegex.test(textBefore)
                ) {
                    return;
                }

                return modelNamesCache.map(name => {
                    const item = new vscode.CompletionItem(`'${name}'`, vscode.CompletionItemKind.Value);
                    const lastChar = textBefore.trim().slice(-1);
                    item.insertText = (lastChar === `'` || lastChar === `"`) ? name : `'${name}'`;
                    item.detail = 'Odoo Models';
                    return item;
                });
            }
        },
        "'", '"'
    );

    const InverseNameProvider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(document, position) {
                const lineText = document.lineAt(position.line).text;

                let comodelName = null;

                // Case 1: Keyword argument - comodel_name="..."
                let keywordMatch = lineText.match(/comodel_name\s*=\s*['"]([^'"]+)['"]/);
                if (keywordMatch) {
                    comodelName = keywordMatch[1];
                } else {
                    // Case 2: Positional argument - first string in fields.One2many(...)
                    let positionalMatch = lineText.match(/fields\.One2many\s*\(\s*['"]([^'"]+)['"]/);
                    if (positionalMatch) {
                        comodelName = positionalMatch[1];
                    }
                }

                if (!comodelName) return;

                const fieldsMap = modelDataCache[comodelName];
                if (!fieldsMap) return;

                return Object.entries(fieldsMap).map(([fieldName, meta]) => {
                    const item = new vscode.CompletionItem(fieldName, vscode.CompletionItemKind.Field);
                    item.insertText = fieldName;
                    item.detail = `Type: ${meta.type}` + (meta.related ? ` → ${meta.related}` : '');
                    return item;
                });
            }
        },
        "'", '"' // Trigger completion inside quotes
    );

    // XML: model name inside <field name="model">
    const XmlModelProvider = vscode.languages.registerCompletionItemProvider(
        'xml',
        {
            provideCompletionItems(document, position) {
                const line = document.lineAt(position);
                const textBefore = line.text.substring(0, position.character);
                const insideModelFieldRegex = /<field\s+[^>]*name\s*=\s*["']model["']\s*>([^<]*)$/;

                if (!insideModelFieldRegex.test(textBefore)) return;

                return modelNamesCache.map(name => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Value);
                    item.insertText = name;
                    item.detail = 'Odoo Model';
                    return item;
                });
            }
        },
        '>'
    );

    // XML: field name suggestion for <field name="...">
    const XmlFieldProvider = vscode.languages.registerCompletionItemProvider(
        'xml',
        {
            provideCompletionItems(document, position) {
                const text = document.getText();
                document.getText(new vscode.Range(new vscode.Position(0, 0), position));
                const modelMatch = text.match(/<field\s+name=["']model["']\s*>([\w.]+)<\/field>/);
                if (!modelMatch) return;

                const modelName = modelMatch[1];
                const fieldsMap = modelDataCache[modelName];
                if (!fieldsMap) return;

                return Object.entries(fieldsMap).map(([fieldName, meta]) => {
                    const item = new vscode.CompletionItem(fieldName, vscode.CompletionItemKind.Field);
                    item.insertText = fieldName;
                    item.detail = `Type: ${meta.type}` + (meta.related ? ` → ${meta.related}` : '');
                    return item;
                });
            }
        },
        '"'
    );
    const RelatedFieldProvider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(document, position) {
                const line = document.lineAt(position);
                const textBefore = line.text.substring(0, position.character);

                const match = textBefore.match(/self((?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)\.$/);
                if (!match) return;

                const chain = match[1].split('.').slice(1); // ['field1', 'field2', ...]
                const text = document.getText();
                const modelMatch = text.match(/_name\s*=\s*['"]([^'"]+)['"]/);
                if (!modelMatch) return;

                let modelName = modelMatch[1];
                let fields = modelDataCache[modelName];

                // Traverse the chain
                for (const fieldName of chain) {
                    if (!fields || !fields[fieldName]) return;
                    const relatedModel = fields[fieldName].related;
                    console.log(`Traversing field: ${fieldName}, related model: ${relatedModel}`);
                    if (!relatedModel || !modelDataCache[relatedModel]) return;
                    modelName = relatedModel;
                    fields = modelDataCache[modelName];
                }

                // Suggest fields from the final model
                return Object.entries(fields).map(([fieldName, meta]) => {
                    const item = new vscode.CompletionItem(fieldName, vscode.CompletionItemKind.Field);
                    item.insertText = fieldName;
                    item.detail = `Type: ${meta.type}` + (meta.related ? ` → ${meta.related}` : '');
                    return item;
                });
            }
        },
        '.' // triggered after dot
    );
    
    context.subscriptions.push(RelatedFieldProvider);
    context.subscriptions.push(ModelProvider);
    context.subscriptions.push(XmlModelProvider);
    context.subscriptions.push(XmlFieldProvider);
    context.subscriptions.push(InverseNameProvider);

    // Watch for changes
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.py');
    const updateModelCache = () => {
        modelDataCache = getAllModelData(workspaceFolders);
        modelNamesCache = Object.keys(modelDataCache);
    };
    watcher.onDidChange(updateModelCache);
    watcher.onDidCreate(updateModelCache);
    watcher.onDidDelete(updateModelCache);
    context.subscriptions.push(watcher);

    return {
        getAllModelData
    };
}

module.exports = {
    registerModelProviders,
    getAllModelData
};