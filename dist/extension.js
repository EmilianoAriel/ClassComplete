"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var import_fs = require("fs");
var path = __toESM(require("path"));
async function getClassesFromFiles(folderPath) {
  const classes = [];
  const includeHtml = vscode.workspace.getConfiguration().get("fileFilter.includeHtml", true);
  const includeJsx = vscode.workspace.getConfiguration().get("fileFilter.includeJsx", true);
  const fileTypes = [
    { extension: ".html", include: includeHtml },
    { extension: ".jsx", include: includeJsx }
  ];
  const files = await import_fs.promises.readdir(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = await import_fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      const subClasses = await getClassesFromFiles(filePath);
      classes.push(...subClasses);
    } else {
      const matchedFileType = fileTypes.find(
        (ft) => file.endsWith(ft.extension) && ft.include
      );
      if (matchedFileType) {
        const content = await import_fs.promises.readFile(filePath, "utf-8");
        const classMatches = content.match(/class=["']([^"']+)["']/g) || content.match(/className=["']([^"']+)["']/g);
        if (classMatches) {
          classMatches.forEach((match) => {
            const classList = match.replace(/class=["']/g, "").replace(/className=["']/g, "").replace(/["']/g, "").split(" ");
            classes.push(...classList);
          });
        }
      }
    }
  }
  return Array.from(new Set(classes));
}
async function activate(context) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    console.error("No hay carpetas en el espacio de trabajo.");
    return;
  }
  const folderPath = workspaceFolders[0].uri.fsPath;
  let classes = await getClassesFromFiles(folderPath);
  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "css" },
    {
      provideCompletionItems(document, position, token, context2) {
        const completionItems = [];
        const linePrefix = document.lineAt(position).text.slice(0, position.character);
        if (linePrefix.endsWith("*")) {
          completionItems.push(
            ...classes.map((className) => {
              const completionItem = new vscode.CompletionItem(
                className,
                vscode.CompletionItemKind.Class
              );
              completionItem.insertText = `.${className}`;
              const editRange = new vscode.Range(
                position.translate(0, -1),
                position
              );
              completionItem.additionalTextEdits = [
                vscode.TextEdit.delete(editRange)
              ];
              return completionItem;
            })
          );
        }
        return completionItems.length ? completionItems : void 0;
      }
    },
    "*"
  );
  context.subscriptions.push(provider);
  const saveListener = vscode.workspace.onWillSaveTextDocument(
    async (event) => {
      const document = event.document;
      if (document.languageId === "html" || document.languageId === "javascriptreact") {
        classes = await getClassesFromFiles(folderPath);
      }
    }
  );
  context.subscriptions.push(saveListener);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
