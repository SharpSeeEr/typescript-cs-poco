"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Options_1 = require("./Options");
class Generator {
    constructor(options) {
        this.indentLevel = 0;
        this.indent = '  ';
        this.options = new Options_1.Options(options);
    }
    generate(pocos, lookup) {
        this.lookup = lookup || {};
        this.lines = [];
        let firstPoco = true;
        for (let item of pocos.filter(p => p.type === 'enum')) {
            if (!firstPoco)
                this.lines.push('');
            this.generateEnum(item);
            firstPoco = false;
            if (!this.lookup[item.name])
                this.lookup[item.name] = item;
        }
        for (let poco of pocos.filter(p => p.type === 'class')) {
            if (!firstPoco)
                this.lines.push('');
            this.generateClass(poco);
            firstPoco = false;
        }
        return this.lines.join('\n');
    }
    addLine(line) {
        if (line && line.length > 0)
            line = this.getIndent() + line;
        else if (!line)
            line = '';
        this.lines.push(line);
    }
    getIndent() {
        let indent = '';
        for (let x = 0; x < this.indentLevel; x++) {
            indent += this.indent;
        }
        return indent;
    }
}
exports.Generator = Generator;
