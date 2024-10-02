// import * as vscode from "vscode";
// import * as fs from "fs";
// import * as path from "path";

// // Función para leer clases de archivos HTML
// async function getClassesFromHTML(folderPath: string): Promise<string[]> {
//   const classes: string[] = [];

//   // Leer el directorio
//   const files = fs.readdirSync(folderPath);

//   for (const file of files) {
//     const filePath = path.join(folderPath, file);

//     // Comprobar si es un directorio o un archivo HTML
//     if (fs.statSync(filePath).isDirectory()) {
//       // Recursivamente buscar en subdirectorios
//       const subClasses = await getClassesFromHTML(filePath);
//       classes.push(...subClasses);
//     } else if (file.endsWith(".html")) {
//       // Leer el archivo HTML
//       const content = fs.readFileSync(filePath, "utf-8");
//       // Expresión regular para encontrar las clases
//       const classMatches = content.match(/class=["']([^"']+)["']/g);

//       if (classMatches) {
//         classMatches.forEach(match => {
//           const classList = match
//             .replace(/class=["']/g, "")
//             .replace(/["']/g, "")
//             .split(" ");
//           classes.push(...classList);
//         });
//       }
//     }
//   }

//   return classes;
// }

// export async function activate(context: vscode.ExtensionContext) {
//   // Obtener la ruta de la carpeta del espacio de trabajo
//   const workspaceFolders = vscode.workspace.workspaceFolders;

//   if (!workspaceFolders) {
//     console.error("No hay carpetas en el espacio de trabajo.");
//     return;
//   }

//   const folderPath = workspaceFolders[0].uri.fsPath; // Usa la primera carpeta del espacio de trabajo

//   // Obtener las clases de los archivos HTML
//   let classes = await getClassesFromHTML(folderPath);
//   console.log("Clases encontradas:", classes);

//   // Proveedor de autocompletado
//   const provider = vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "*" }, // Funciona en todos los lenguajes
//     {
//       provideCompletionItems(
//         document: vscode.TextDocument,
//         position: vscode.Position,
//         token: vscode.CancellationToken,
//         context: vscode.CompletionContext
//       ) {
//         const completionItems: vscode.CompletionItem[] = [];
//         const linePrefix = document
//           .lineAt(position)
//           .text.slice(0, position.character);

//         // Verificar si el activador es "*"
//         if (linePrefix.endsWith("*")) {
//           completionItems.push(
//             ...classes.map(className => {
//               const completionItem = new vscode.CompletionItem(
//                 className,
//                 vscode.CompletionItemKind.Class
//               );
//               completionItem.insertText = className;

//               // Usar additionalTextEdits para borrar el '*'
//               const editRange = new vscode.Range(
//                 position.translate(0, -1),
//                 position
//               );
//               completionItem.additionalTextEdits = [
//                 vscode.TextEdit.delete(editRange),
//               ];

//               return completionItem;
//             })
//           );
//         }

//         return completionItems.length ? completionItems : undefined;
//       },
//     },
//     "*" // El activador es "*"
//   );

//   context.subscriptions.push(provider);

//   // Escuchar cambios en los archivos HTML
//   const docChangeListener = vscode.workspace.onDidChangeTextDocument(
//     async event => {
//       const document = event.document;

//       // Verificar si el documento es HTML
//       if (document.languageId === "html") {
//         // Actualizar las clases
//         classes = await getClassesFromHTML(folderPath);
//         console.log("Clases actualizadas:", classes);
//       }
//     }
//   );

//   context.subscriptions.push(docChangeListener);
// }

// export function deactivate() {}

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// Función para leer clases de archivos HTML y JSX
async function getClassesFromFiles(folderPath: string): Promise<string[]> {
  const classes: string[] = [];

  // Leer el directorio
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // Comprobar si es un directorio o un archivo HTML/JSX
    if (fs.statSync(filePath).isDirectory()) {
      // Recursivamente buscar en subdirectorios
      const subClasses = await getClassesFromFiles(filePath);
      classes.push(...subClasses);
    } else if (
      file.endsWith(".html") ||
      file.endsWith(".jsx") ||
      file.endsWith(".js")
    ) {
      // Leer el archivo HTML o JSX
      const content = fs.readFileSync(filePath, "utf-8");
      // Expresión regular para encontrar las clases
      const classMatches =
        content.match(/class=["']([^"']+)["']/g) ||
        content.match(/className=["']([^"']+)["']/g);

      if (classMatches) {
        classMatches.forEach(match => {
          const classList = match
            .replace(/class=["']/g, "")
            .replace(/className=["']/g, "")
            .replace(/["']/g, "")
            .split(" ");
          classes.push(...classList);
        });
      }
    }
  }

  return classes;
}

export async function activate(context: vscode.ExtensionContext) {
  // Obtener la ruta de la carpeta del espacio de trabajo
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    console.error("No hay carpetas en el espacio de trabajo.");
    return;
  }

  const folderPath = workspaceFolders[0].uri.fsPath; // Usa la primera carpeta del espacio de trabajo

  // Obtener las clases de los archivos HTML y JSX
  let classes = await getClassesFromFiles(folderPath);
  console.log("Clases encontradas:", classes);

  // Proveedor de autocompletado
  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "*" }, // Funciona en todos los lenguajes
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

        // Verificar si el activador es "*"
        if (linePrefix.endsWith("*")) {
          completionItems.push(
            ...classes.map(className => {
              const completionItem = new vscode.CompletionItem(
                className,
                vscode.CompletionItemKind.Class
              );
              completionItem.insertText = className;

              // Usar additionalTextEdits para borrar el '*'
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
    "*" // El activador es "*"
  );

  context.subscriptions.push(provider);

  // Escuchar cambios en los archivos HTML y JSX
  const docChangeListener = vscode.workspace.onDidChangeTextDocument(
    async event => {
      const document = event.document;

      // Verificar si el documento es HTML o JSX
      if (
        document.languageId === "html" ||
        document.languageId === "javascriptreact"
      ) {
        // Actualizar las clases
        classes = await getClassesFromFiles(folderPath);
        console.log("Clases actualizadas:", classes);
      }
    }
  );

  context.subscriptions.push(docChangeListener);
}

export function deactivate() {}
