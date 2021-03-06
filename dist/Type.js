"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SafeRegEx_1 = require("./SafeRegEx");
class TypeConversion {
    constructor(source, dest, defaultValue) {
        this.source = source;
        this.dest = dest;
        this.defaultValue = defaultValue;
    }
}
exports.TypeConversion = TypeConversion;
const defaultTypescriptTranslations = {
    int: () => new TypeConversion("int", "number", '0'),
    double: () => new TypeConversion("double", "number", '0'),
    float: () => new TypeConversion("float", "number", '0'),
    Int32: () => new TypeConversion("Int32", "number", '0'),
    Int64: () => new TypeConversion("Int64", "number", '0'),
    short: () => new TypeConversion("short", "number", '0'),
    long: () => new TypeConversion("long", "number", '0'),
    decimal: () => new TypeConversion("decimal", "number", '0'),
    bool: () => new TypeConversion("bool", "boolean", 'false'),
    DateTime: () => new TypeConversion("DateTime", "Date", "null"),
    Guid: () => new TypeConversion("Guid", "string", "''"),
    string: () => new TypeConversion("string", "string", "''"),
    JObject: () => new TypeConversion("JObject", "any", '{}'),
    dynamic: () => new TypeConversion("dynamic", "any", '{}'),
    object: () => new TypeConversion("object", "any", '{}')
};
const defaultJavascriptTranslations = {
    int: () => new TypeConversion("int", "number", '0'),
    double: () => new TypeConversion("double", "number", '0'),
    float: () => new TypeConversion("float", "number", '0'),
    Int32: () => new TypeConversion("Int32", "number", '0'),
    Int64: () => new TypeConversion("Int64", "number", '0'),
    short: () => new TypeConversion("short", "number", '0'),
    long: () => new TypeConversion("long", "number", '0'),
    decimal: () => new TypeConversion("decimal", "number", '0'),
    bool: () => new TypeConversion("bool", "boolean", 'false'),
    DateTime: () => new TypeConversion("DateTime", "string", "''"),
    Guid: () => new TypeConversion("Guid", "string", "''"),
    string: () => new TypeConversion("string", "string", "''"),
    JObject: () => new TypeConversion("JObject", "any", '{}'),
    dynamic: () => new TypeConversion("dynamic", "any", '{}'),
    object: () => new TypeConversion("object", "any", '{}')
};
class Type {
    get generics() { return this.genericTypes; }
    set generics(value) {
        this.genericTypes = value;
        if (!value || value.length == 0)
            this.hasGenerics = false;
        else
            this.hasGenerics = true;
    }
    getDefaultValue() {
        return this.conversion.defaultValue || 'null';
        // if (this.defaultValue) return this.defaultValue;
        // if (this.isArray) return '[]';
        // if (this.name === 'object') return '{}';
        // return `new ${this.name}()`;
        //return 'null';
        //return this.defaultValue; // Type.defaultValues[this.name] || '{}';
    }
    static addCustomTypeTranslations(customTypeTranslations) {
        Object.assign(this.typeTranslations, customTypeTranslations);
    }
    static parse(typeCandidate, scope) {
        let type = new Type();
        type.name = typeCandidate;
        type.resolvedFrom = typeCandidate;
        Type.tryTranslateType(type) ||
            Type.tryParseArray(type) ||
            Type.tryParseCollection(type) ||
            Type.tryParseDictionary(type) ||
            Type.tryParseGeneric(type) ||
            Type.tryParseDefault(type);
        return type;
    }
    static tryTranslateType(type) {
        let translater = this.typeTranslations[type.name];
        if (translater) {
            type.conversion = translater();
            //type.name = typeConversion.dest;
            //type.defaultValue = typeConversion.defaultValue;
            if (type.name === 'any')
                type.isObject = true;
            return true;
        }
        return false;
    }
    static tryParseGeneric(type) {
        const match = this.safeRegEx.match(this.expressions.genericProperty, type.name)[0];
        if (match) {
            type.name = match[1];
            type.generics = match[2]
                .split(",")
                .map(x => this.parse(x.trim()));
            type.conversion = new TypeConversion(type.name, `${type.name}<${match[2]}>`, `new ${type.name}<${match[2]}>()`);
        }
        return !!match;
    }
    static tryParseArray(type) {
        const match = this.safeRegEx.match(this.expressions.array, type.name)[0];
        if (match) {
            type.name = match[1];
            type.isArray = true;
            type.conversion = new TypeConversion(type.name, `${type.name}[]`, '[]');
        }
        return !!match;
    }
    static tryParseCollection(type) {
        const match = this.safeRegEx.match(this.expressions.collection, type.name)[0];
        if (match) {
            //console.log(match);
            type.isArray = true;
            type.name = match[1];
            type.generics = [this.parse(match[2])];
            type.conversion = new TypeConversion(type.name, `${type.generics[0].name}[]`, '[]');
        }
        return !!match;
    }
    static tryParseDictionary(type) {
        const match = this.safeRegEx.match(this.expressions.dictionary, type.name)[0];
        if (match) {
            //console.log(match);
            type.isDictionary = true;
            let type1 = match[1];
            let type2 = match[2];
            type.generics = [this.parse(type1), this.parse(type2)];
            type.conversion = new TypeConversion(type.name, `any`, '{}');
        }
        return !!match;
    }
    static tryParseDefault(type) {
        type.conversion = new TypeConversion(type.name, type.name, `new ${type.name}()`);
        return true;
    }
}
Type.typeTranslations = Object.assign({}, defaultTypescriptTranslations);
Type.safeRegEx = new SafeRegEx_1.SafeRegEx();
Type.expressions = {
    collection: /^(I?List|IEnumerable|ICollection|HashSet)<([\w\d]+)>$/gm,
    dictionary: /^I?Dictionary<([\w\d]+),\s?([\w\d]+)>$/g,
    array: /^([\w\d]+)\[\]$/gm,
    genericProperty: /^([\w\d]+)<([\w\d\<\> ,]+)>$/gm
};
exports.Type = Type;
