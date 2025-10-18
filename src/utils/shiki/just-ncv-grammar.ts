const grammar = {
  scopeName: "source.just-ncv",
  name: "Just NCV",
  patterns: [
    // Decorators (must come before other patterns)
    {
      match: "@[a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*",
      name: "entity.name.function.decorator.just-ncv"
    },

    // Control keywords (including flow control without duplicates)
    {
      match: "\\b(var|const|let|mut|func|if|elif|else|match|case|for|while|foreach|do|return|struct|enum|interface|class|impl|import|from|use|export|module|try|except|finally|raise|lambda|switch|break|continue)\\b",
      name: "keyword.control.just-ncv"
    },

    // Async/concurrency keywords
    {
      match: "\\b(async|await|yield|defer|go)\\b",
      name: "keyword.control.async.just-ncv"
    },

    // Assertion and debug keywords
    {
      match: "\\b(assert|debug|macro)\\b",
      name: "keyword.control.debug.just-ncv"
    },

    // Type keywords
    {
      match: "\\b(int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float|float32|float64|double|str|string|char|bool|void|null|any|complex|complex64|date|time|datetime|tuple|optional|union|array|vector|map|set|queue|stack|linked_list|chan)\\b",
      name: "storage.type.just-ncv"
    },

    // Generic types: <Type> or <int, str> etc.
    {
      match: "<[A-Za-z0-9_,\\s\\?\\:<>]+>",
      name: "storage.type.generic.just-ncv"
    },

    // Boolean literals
    {
      match: "\\b(true|false)\\b",
      name: "constant.language.boolean.just-ncv"
    },

    // Built-in functions
    {
      match: "\\b(print|len|type|range|sort|filter|map|reduce|zip|enumerate|sqrt|abs|min|max|sum|avg|pow|log|sin|cos|tan)\\b",
      name: "support.function.builtin.just-ncv"
    },

    // Numeric literals: binary, octal, hex, float with exponent
    {
      match: "\\b(0b[01_]+|0o[0-7_]+|0x[0-9A-Fa-f_]+|\\d[0-9_]*(?:\\.\\d[0-9_]*)?(?:[eE][+-]?\\d[0-9_]*)?)\\b",
      name: "constant.numeric.just-ncv"
    },

    // Operators (without word boundary for non-alphanumeric)
    {
      match: "([+\\-*/=<>!&|?:^]+|\\+\\+|--|<<|>>|<=|>=|==|!=|&&|\\|\\||\\+=|\\-=|\\*=|/=|%=|\\*\\*=|&=|\\|=|\\^=|<<=|>>=)",
      name: "keyword.operator.just-ncv"
    },

    // Punctuation (braces, brackets, parens, etc.)
    {
      match: "[{}\\(\\)\\[\\];:,.]|::|->|=>",
      name: "punctuation.separator.just-ncv"
    },

    // Line comments with # (primary comment style for just-ncv)
    {
      match: "#.*$",
      name: "comment.line.just-ncv"
    },

    // Doc comments with ///
    {
      match: "///.*$",
      name: "comment.line.documentation.just-ncv"
    },

    // Block comments /* ... */
    {
      begin: "/\\*",
      end: "\\*/",
      name: "comment.block.just-ncv"
    },

    // Triple-quoted strings (multiline) - must come before single quotes
    {
      begin: '"""',
      end: '"""',
      name: "string.quoted.triple.just-ncv",
      patterns: [
        { match: "\\\\.", name: "constant.character.escape.just-ncv" }
      ]
    },

    {
      begin: "'''",
      end: "'''",
      name: "string.quoted.triple.single.just-ncv",
      patterns: [
        { match: "\\\\.", name: "constant.character.escape.just-ncv" }
      ]
    },

    // Template/backtick strings with ${...} interpolation
    {
      begin: "`",
      end: "`",
      name: "string.interpolated.backtick.just-ncv",
      patterns: [
        { match: "\\\\[`\\\\$]", name: "constant.character.escape.just-ncv" },
        {
          begin: "\\$\\{",
          end: "\\}",
          name: "source.embedded.expression.just-ncv",
          patterns: [
            { match: "[a-zA-Z_][a-zA-Z0-9_]*", name: "variable.other.just-ncv" }
          ]
        }
      ]
    },

    // Double-quoted strings
    {
      begin: '"',
      end: '"',
      name: "string.quoted.double.just-ncv",
      patterns: [
        { match: "\\\\.", name: "constant.character.escape.just-ncv" },
        {
          begin: "\\$\\{",
          end: "\\}",
          name: "source.embedded.expression.just-ncv",
          patterns: [
            { match: "[a-zA-Z_][a-zA-Z0-9_]*", name: "variable.other.just-ncv" }
          ]
        }
      ]
    },

    // Single-quoted strings
    {
      begin: "'",
      end: "'",
      name: "string.quoted.single.just-ncv",
      patterns: [
        { match: "\\\\.", name: "constant.character.escape.just-ncv" }
      ]
    },

    // Function declarations with name capture
    {
      match: "\\b(func)\\s+([A-Za-z_][A-Za-z0-9_]*)\\b",
      captures: {
        "1": { name: "keyword.declaration.just-ncv" },
        "2": { name: "entity.name.function.just-ncv" }
      }
    },

    // Struct/class/enum/interface declarations
    {
      match: "\\b(struct|class|enum|interface)\\s+([A-Za-z_][A-Za-z0-9_]*)\\b",
      captures: {
        "1": { name: "keyword.declaration.just-ncv" },
        "2": { name: "entity.name.type.just-ncv" }
      }
    },

    // Variable declarations
    {
      match: "\\b(var|let|const|mut)\\s+([A-Za-z_][A-Za-z0-9_]*)\\b",
      captures: {
        "1": { name: "keyword.declaration.just-ncv" },
        "2": { name: "variable.other.declaration.just-ncv" }
      }
    },

    // Macro declarations
    {
      match: "\\b(macro)\\s+([A-Za-z_][a-zA-Z0-9_]*)\\b",
      captures: {
        "1": { name: "keyword.declaration.just-ncv" },
        "2": { name: "entity.name.function.macro.just-ncv" }
      }
    }
  ],
  repository: {},
  repositoryName: "just-ncv",
  injections: {},
  uuid: "just-ncv-grammar"
};

export default grammar;
