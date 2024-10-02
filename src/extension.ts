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
//   // Cambia esta ruta por la carpeta donde están tus archivos HTML
//   const workspaceFolders = vscode.workspace.workspaceFolders;

//   if (!workspaceFolders) {
//     console.error("No hay carpetas en el espacio de trabajo.");
//     return;
//   }

//   const folderPath = workspaceFolders[0].uri.fsPath; // Usa la primera carpeta del espacio de trabajo

//   // Cambiar a 'let' para permitir reasignación
//   let classes = await getClassesFromHTML(folderPath);
//   console.log("Clases encontradas:", classes);

//   // Proveedor de autocompletado para CSS
//   const provider = vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "css" }, // Funciona solo en archivos CSS
//     {
//       provideCompletionItems(
//         document: vscode.TextDocument,
//         position: vscode.Position
//       ) {
//         try {
//           const linePrefix = document
//             .lineAt(position)
//             .text.slice(0, position.character);

//           // Inicializa un array para los items de completado
//           const completionItems: vscode.CompletionItem[] = [];

//           // Comprobar si termina con un punto para sugerir clases
//           if (linePrefix.endsWith(".")) {
//             console.log("Triggered by dot at the end");
//             completionItems.push(
//               ...classes.map(className => {
//                 const completionItem = new vscode.CompletionItem(
//                   className,
//                   vscode.CompletionItemKind.Class // Tipo de clase para CSS
//                 );
//                 completionItem.insertText = className; // Texto que se insertará
//                 return completionItem;
//               })
//             );

//             // Imprimir todas las clases en consola al presionar "."
//             console.log("Clases disponibles:", classes);
//           }

//           // Devuelve los items de completado, o undefined si no hay
//           return completionItems.length ? completionItems : undefined;
//         } catch (error) {
//           console.error("Error en el proveedor de autocompletado:", error);
//         }
//         return undefined;
//       },
//     },
//     "." // Desencadenador para clases
//   );

//   context.subscriptions.push(provider);

//   // Escuchar cambios en documentos
//   const docChangeListener = vscode.workspace.onDidChangeTextDocument(
//     async event => {
//       const document = event.document;

//       // Verificar si el documento guardado es un archivo HTML
//       if (document.languageId === "html") {
//         // Volver a obtener las clases de los archivos HTML
//         classes = await getClassesFromHTML(folderPath);
//         console.log("Clases actualizadas:", classes);
//       }
//     }
//   );

//   context.subscriptions.push(docChangeListener);
// }

// export function deactivate() {}

// <------------->

// import * as vscode from "vscode";

// export function activate(context: vscode.ExtensionContext) {
//   // Proveedor de autocompletado general para todos los lenguajes
//   let provider = vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "*" }, // Aceptar todos los lenguajes
//     {
//       provideCompletionItems(
//         document: vscode.TextDocument,
//         position: vscode.Position,
//         token: vscode.CancellationToken,
//         context: vscode.CompletionContext
//       ) {
//         // Lista de identificadores sugeridos con el punto al inicio
//         const completionItems = [
//           ".customClass",
//           ".gridContainer",
//           ".centerContent",
//           ".responsiveLayout",
//           ".primaryButton",
//         ];

//         // Convertir la lista de identificadores en elementos de autocompletado
//         return completionItems.map(item => {
//           const completionItem = new vscode.CompletionItem(
//             item,
//             vscode.CompletionItemKind.Class
//           );

//           // Detalle adicional en las sugerencias
//           completionItem.detail = "Custom Class Suggestion";

//           // Usamos insertText para definir lo que se insertará (la clase sugerida)
//           completionItem.insertText = item;

//           // Usamos additionalTextEdits para borrar el activador '*'
//           const editRange = new vscode.Range(
//             position.translate(0, -1),
//             position
//           ); // Borrar el '*'
//           completionItem.additionalTextEdits = [
//             vscode.TextEdit.delete(editRange),
//           ]; // Borrar el '*'

//           return completionItem;
//         });
//       },
//     },
//     "*" // El activador de autocompletado es '*'
//   );

//   // Registrar el proveedor
//   context.subscriptions.push(provider);
// }

// export function deactivate() {}

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// Función para leer clases de archivos HTML
async function getClassesFromHTML(folderPath: string): Promise<string[]> {
  const classes: string[] = [];

  // Leer el directorio
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // Comprobar si es un directorio o un archivo HTML
    if (fs.statSync(filePath).isDirectory()) {
      // Recursivamente buscar en subdirectorios
      const subClasses = await getClassesFromHTML(filePath);
      classes.push(...subClasses);
    } else if (file.endsWith(".html")) {
      // Leer el archivo HTML
      const content = fs.readFileSync(filePath, "utf-8");
      // Expresión regular para encontrar las clases
      const classMatches = content.match(/class=["']([^"']+)["']/g);

      if (classMatches) {
        classMatches.forEach(match => {
          const classList = match
            .replace(/class=["']/g, "")
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

  // Obtener las clases de los archivos HTML
  let classes = await getClassesFromHTML(folderPath);
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

  // Escuchar cambios en los archivos HTML
  const docChangeListener = vscode.workspace.onDidChangeTextDocument(
    async event => {
      const document = event.document;

      // Verificar si el documento es HTML
      if (document.languageId === "html") {
        // Actualizar las clases
        classes = await getClassesFromHTML(folderPath);
        console.log("Clases actualizadas:", classes);
      }
    }
  );

  context.subscriptions.push(docChangeListener);
}

export function deactivate() {}
