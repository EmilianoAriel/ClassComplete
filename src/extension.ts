// import * as vscode from "vscode";

// export function activate(context: vscode.ExtensionContext) {
//   const provider1 = vscode.languages.registerCompletionItemProvider("css", {
//     provideCompletionItems(
//       document: vscode.TextDocument,
//       position: vscode.Position,
//       token: vscode.CancellationToken,
//       context: vscode.CompletionContext
//     ) {
//       console.log("Completion Provider Triggered");

//       // Obtener el texto antes del cursor
//       const preText = document
//         .lineAt(position)
//         .text.substring(0, position.character);
//       console.log("ProvideCompletionItems triggered with text:", preText);

//       // Verificar que el texto termina en '.'
//       if (!preText.endsWith(".")) {
//         return undefined; // No devolver sugerencias si no termina en '.'
//       }

//       // Definir un array de opciones de clases
//       const classOptions = ["container", "box", "grid"];

//       // Crear un array de CompletionItems a partir de las opciones
//       const completionItems = classOptions.map(className => {
//         return new vscode.CompletionItem(
//           className,
//           vscode.CompletionItemKind.Class
//         );
//       });

//       console.log("Completion items:", completionItems);
//       return completionItems; // Devolver las opciones de completado
//     },
//   });

//   context.subscriptions.push(provider1);
// }

// export function deactivate() {}

// src/extension.ts
// src/extension.ts
// import * as vscode from "vscode";
// import * as path from "path";
// import { parseDocument } from "htmlparser2";
// import * as fs from "fs";

// export function activate(context: vscode.ExtensionContext) {
//   let disposable = vscode.commands.registerCommand(
//     "class-complete.mostrarContenidoClases",
//     async () => {
//       // Obtiene el editor activo
//       const editor = vscode.window.activeTextEditor;

//       if (editor) {
//         const document = editor.document;

//         // Verifica si el archivo es CSS
//         if (document.languageId !== "css") {
//           vscode.window.showErrorMessage(
//             "Este comando solo se puede usar en archivos CSS."
//           );
//           return;
//         }

//         // Genera el nombre del archivo HTML correspondiente
//         const htmlFileName = "prueba.html"; // Cambia esto a tu nombre de archivo HTML
//         const htmlFilePath = path.join(
//           path.dirname(document.fileName),
//           htmlFileName
//         );

//         // Verifica si el archivo HTML existe
//         if (!fs.existsSync(htmlFilePath)) {
//           vscode.window.showErrorMessage(
//             `No se pudo encontrar el archivo HTML: ${htmlFilePath}`
//           );
//           return;
//         }

//         // Lee el contenido del archivo HTML
//         const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

//         // Parsear el contenido HTML
//         const parsedDocument = parseDocument(htmlContent);

//         // Verificar si el CSS está enlazado en el HTML
//         const cssFileRelativePath = path.relative(
//           path.dirname(htmlFilePath),
//           document.fileName
//         );
//         const isCssLinked = parsedDocument.children.some(
//           (node: any) =>
//             node.type === "tag" &&
//             node.name === "link" &&
//             node.attribs &&
//             node.attribs.href === cssFileRelativePath
//         );

//         if (!isCssLinked) {
//           vscode.window.showErrorMessage(
//             "El archivo CSS no está enlazado al archivo HTML correspondiente."
//           );
//           return;
//         }

//         // Función recursiva para buscar elementos con clase
//         const buscarClases = (node: any) => {
//           if (node.type === "tag" && node.attribs && node.attribs.class) {
//             const content = node.children
//               .map((child: any) => child.data)
//               .join("");
//             console.log(content);
//           }

//           if (node.children) {
//             node.children.forEach(buscarClases);
//           }
//         };

//         buscarClases(parsedDocument);

//         vscode.window.showInformationMessage(
//           "Contenido de las clases se ha mostrado en la consola."
//         );
//       } else {
//         vscode.window.showErrorMessage("No hay un editor activo.");
//       }
//     }
//   );

//   context.subscriptions.push(disposable);
// }

// export function deactivate() {}

// import * as vscode from "vscode";
// import * as path from "path";
// import { parseDocument } from "htmlparser2";
// import * as fs from "fs";

// // Activación de la extensión
// export function activate(context: vscode.ExtensionContext) {
//   // Función para mostrar el contenido de las clases
//   const mostrarContenidoClases = async (editor: vscode.TextEditor) => {
//     const document = editor.document;

//     // Verifica si el archivo es CSS
//     if (document.languageId !== "css") {
//       return; // Solo procede si es un archivo CSS
//     }

//     // Obtiene la posición del cursor
//     const position = editor.selection.active;

//     // Verifica si el carácter actual es un punto '.'
//     const texto = document.getText();
//     const lastChar = texto.charAt(position.character - 1); // Carácter justo antes del cursor

//     if (lastChar !== ".") {
//       return; // Sale si no es un punto
//     }

//     // Obtener la ruta del directorio del archivo CSS
//     const cssDir = path.dirname(document.fileName);

//     // Leer todos los archivos HTML en el mismo directorio
//     const files = fs.readdirSync(cssDir).filter(file => file.endsWith(".html"));

//     if (files.length === 0) {
//       vscode.window.showErrorMessage(
//         "No se encontraron archivos HTML en el directorio."
//       );
//       return;
//     }

//     files.forEach(file => {
//       const htmlFilePath = path.join(cssDir, file);
//       const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

//       // Parsear el contenido HTML
//       const parsedDocument = parseDocument(htmlContent);

//       // Función recursiva para buscar elementos con clase
//       const buscarClases = (node: any) => {
//         if (node.type === "tag" && node.attribs && node.attribs.class) {
//           const content = node.children
//             .map((child: any) => child.data)
//             .join("");
//           console.log(`Contenido de clase "${node.attribs.class}":`, content);
//         }

//         if (node.children) {
//           node.children.forEach(buscarClases);
//         }
//       };

//       buscarClases(parsedDocument);
//     });

//     vscode.window.showInformationMessage(
//       "Se ha mostrado el contenido de las clases en la consola."
//     );
//   };

//   // Listener para cambios en el documento
//   const disposable = vscode.workspace.onDidChangeTextDocument(event => {
//     if (event.document.languageId === "css") {
//       const editor = vscode.window.activeTextEditor;
//       if (editor && editor.document === event.document) {
//         mostrarContenidoClases(editor);
//       }
//     }
//   });

//   context.subscriptions.push(disposable);
// }

// // Función de desactivación de la extensión
// export function deactivate() {}

// import * as vscode from "vscode";

// export function activate(context: vscode.ExtensionContext) {
//   // Registra un proveedor de autocompletado para todos los archivos
//   const provider = vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "*" }, // Ahora funciona en todos los archivos
//     {
//       provideCompletionItems(
//         document: vscode.TextDocument,
//         position: vscode.Position
//       ) {
//         try {
//           const linePrefix = document
//             .lineAt(position)
//             .text.slice(0, position.character);
//           console.log("linePrefix:", linePrefix); // Agregar log para depuración

//           // Si la línea termina con un punto
//           if (linePrefix.endsWith(".")) {
//             console.log("Triggered by dot");
//             const completionItem = new vscode.CompletionItem(
//               "Hola mundo",
//               vscode.CompletionItemKind.Text
//             );
//             completionItem.insertText = "Hola mundo";
//             return [completionItem];
//           }

//           console.log(vscode.CompletionItem);
//         } catch (error) {
//           console.error("Error en el proveedor de autocompletado:", error);
//         }
//         return undefined;
//       },
//     },
//     "." // Desencadenador: punto
//   );

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
  // Cambia esta ruta por la carpeta donde están tus archivos HTML
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    console.error("No hay carpetas en el espacio de trabajo.");
    return;
  }

  const folderPath = workspaceFolders[0].uri.fsPath; // Usa la primera carpeta del espacio de trabajo

  // Cambiar a 'let' para permitir reasignación
  let classes = await getClassesFromHTML(folderPath);
  console.log("Clases encontradas:", classes);

  // Proveedor de autocompletado para CSS
  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "css" }, // Funciona solo en archivos CSS
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        try {
          const linePrefix = document
            .lineAt(position)
            .text.slice(0, position.character);

          // Inicializa un array para los items de completado
          const completionItems: vscode.CompletionItem[] = [];

          // Comprobar si termina con un punto para sugerir clases
          if (linePrefix.endsWith(".")) {
            console.log("Triggered by dot at the end");
            completionItems.push(
              ...classes.map(className => {
                const completionItem = new vscode.CompletionItem(
                  className,
                  vscode.CompletionItemKind.Class // Tipo de clase para CSS
                );
                completionItem.insertText = className; // Texto que se insertará
                return completionItem;
              })
            );

            // Imprimir todas las clases en consola al presionar "."
            console.log("Clases disponibles:", classes);
          }

          // Devuelve los items de completado, o undefined si no hay
          return completionItems.length ? completionItems : undefined;
        } catch (error) {
          console.error("Error en el proveedor de autocompletado:", error);
        }
        return undefined;
      },
    },
    "." // Desencadenador para clases
  );

  context.subscriptions.push(provider);

  // Escuchar cambios en documentos
  const docChangeListener = vscode.workspace.onDidChangeTextDocument(
    async event => {
      const document = event.document;

      // Verificar si el documento guardado es un archivo HTML
      if (document.languageId === "html") {
        // Volver a obtener las clases de los archivos HTML
        classes = await getClassesFromHTML(folderPath);
        console.log("Clases actualizadas:", classes);
      }
    }
  );

  context.subscriptions.push(docChangeListener);
}

export function deactivate() {}
