import * as vscode from 'vscode';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

async function getClassesFromFiles(folderPath: string): Promise<string[]> {
  const classes: string[] = [];

  const includeHtml = vscode.workspace
    .getConfiguration()
    .get<boolean>('fileFilter.includeHtml', true);
  const includeJsx = vscode.workspace
    .getConfiguration()
    .get<boolean>('fileFilter.includeJsx', true);

  const fileTypes: { extension: string; include: boolean }[] = [
    { extension: '.html', include: includeHtml },
    { extension: '.jsx', include: includeJsx },
  ];

  const files = await fsPromises.readdir(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = await fsPromises.stat(filePath);

    if (stats.isDirectory()) {
      const subClasses = await getClassesFromFiles(filePath);
      classes.push(...subClasses);
    } else {
      const matchedFileType = fileTypes.find(
        (ft) => file.endsWith(ft.extension) && ft.include
      );

      if (matchedFileType) {
        const content = await fsPromises.readFile(filePath, 'utf-8');
        const classMatches =
          content.match(/class=["']([^"']+)["']/g) ||
          content.match(/className=["']([^"']+)["']/g);

        if (classMatches) {
          classMatches.forEach((match) => {
            const classList = match
              .replace(/class=["']/g, '')
              .replace(/className=["']/g, '')
              .replace(/["']/g, '')
              .split(' ');
            classes.push(...classList);
          });
        }
      }
    }
  }

  return Array.from(new Set(classes));
}

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    console.error('No hay carpetas en el espacio de trabajo.');
    return;
  }

  const folderPath = workspaceFolders[0].uri.fsPath;
  let classes = await getClassesFromFiles(folderPath);

  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'css' },
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const completionItems: vscode.CompletionItem[] = [];
        const linePrefix = document
          .lineAt(position)
          .text.slice(0, position.character);

        if (linePrefix.endsWith('*')) {
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
                vscode.TextEdit.delete(editRange),
              ];

              return completionItem;
            })
          );
        }

        return completionItems.length ? completionItems : undefined;
      },
    },
    '*'
  );

  context.subscriptions.push(provider);

  const saveListener = vscode.workspace.onWillSaveTextDocument(
    async (event) => {
      const document = event.document;

      if (
        document.languageId === 'html' ||
        document.languageId === 'javascriptreact'
      ) {
        classes = await getClassesFromFiles(folderPath);
      }
    }
  );

  context.subscriptions.push(saveListener);
}

export function deactivate() {}
