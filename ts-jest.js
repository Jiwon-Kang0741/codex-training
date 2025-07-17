const ts = require('typescript');

module.exports = {
  process(src, filename) {
    const result = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        // Use the modern JSX runtime so React import is not required
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2017,
      },
      fileName: filename,
    });
    return { code: result.outputText };
  },
};
