# Sistema de Gestión de Inventario v2.0 (SSG Astro + React)

Este proyecto es una interfaz moderna, rápida y dinámica para gestionar tu inventario, conectada directamente a una hoja de Google Sheets.

## Tecnologías Utilizadas
- **Astro**: Framework rápido en modo SSG (Generación de Sitio Estático).
- **React**: Para la interactividad (manejo de estado, modales, CRUD en tiempo real).
- **Tailwind CSS**: Estilos limpios y de nivel empresarial (enterprise UI).
- **Lucide-react**: Iconos modernos.
- **Google Apps Script**: Backend serverless conectado a Google Sheets.

---

## 1. Configuración de Google Sheets (Backend)

Para que el frontend pueda leer y modificar datos, necesitas configurar tu hoja de cálculo y publicar un script.

### Columnas Obligatorias (Primera fila, A-O aproximadamente)
Tus columnas en Google Sheets deben estar configuradas, preferiblemente, en este orden u obtenerse a través de los índices correctos. El código de abajo buscará la primera fila como encabezado.

### Código de Google Apps Script (`Code.gs`)
1. Ve a **Extensiones > Apps Script** en tu hoja de Google Sheets.
2. Borra el código existente y pega lo siguiente:

```javascript
// Nombre de la hoja donde están los datos
const SHEET_NAME = 'Inventario';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    return {
      sku: row[0],
      nombre: row[1],
      categoria: row[2],
      talla: row[3],
      color: row[4],
      marca: row[5],
      stockInicial: row[6],
      entradas: row[7],
      salidas: row[8],
      stockActual: row[9],
      stockMinimo: row[10],
      costo: row[11],
      precio: row[12],
      valorTotal: row[13],
      proveedor: row[14],
      fechaUltimaEntrada: row[15],
      estado: row[16]
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  // CORS Headers
  const headers = { "Access-Control-Allow-Origin": "*" };
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sku = payload.sku;
    
    if (action === "create") {
      const p = payload.data;
      sheet.appendRow([
        p.sku, p.nombre, p.categoria, p.talla, p.color, p.marca, 
        p.stockInicial, p.entradas, p.salidas, 
        p.stockInicial + p.entradas - p.salidas, // Stock Actual
        p.stockMinimo, p.costo, p.precio, 
        (p.costo * (p.stockInicial + p.entradas - p.salidas)), // Valor Total
        p.proveedor, p.fechaUltimaEntrada, ""
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Creado" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "update" || action === "delete") {
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      // Buscar el SKU en la columna A (índice 0)
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == sku) {
          rowIndex = i + 1; // +1 porque getRange es base 1
          break;
        }
      }
      
      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: "SKU no encontrado" })).setMimeType(ContentService.MimeType.JSON);
      }
      
      if (action === "delete") {
        sheet.deleteRow(rowIndex);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Eliminado" })).setMimeType(ContentService.MimeType.JSON);
      }
      
      if (action === "update") {
        const p = payload.data;
        // Sólo actualizamos columnas no calculadas o, de ser necesario, sobrescribimos todo.
        // Asume orden: SKU, Nombre, Categ, Talla, Color, Marca, S.Ini, Entr, Sal, S.Act, S.Min, Costo, Precio, Total, Prov, Fecha
        const rowRange = sheet.getRange(rowIndex, 1, 1, 16); 
        // Generar arreglo de nueva fila:
        const currentData = sheet.getRange(rowIndex, 1, 1, 17).getValues()[0];
        const newRow = [
          p.sku || currentData[0],
          p.nombre !== undefined ? p.nombre : currentData[1],
          p.categoria !== undefined ? p.categoria : currentData[2],
          p.talla !== undefined ? p.talla : currentData[3],
          p.color !== undefined ? p.color : currentData[4],
          p.marca !== undefined ? p.marca : currentData[5],
          p.stockInicial !== undefined ? p.stockInicial : currentData[6],
          p.entradas !== undefined ? p.entradas : currentData[7],
          p.salidas !== undefined ? p.salidas : currentData[8],
          p.stockActual !== undefined ? p.stockActual : currentData[9], // Actualiza Stock Actual
          p.stockMinimo !== undefined ? p.stockMinimo : currentData[10],
          p.costo !== undefined ? p.costo : currentData[11],
          p.precio !== undefined ? p.precio : currentData[12],
          p.valorTotal !== undefined ? p.valorTotal : currentData[13], // Actualiza Valor Total
          p.proveedor !== undefined ? p.proveedor : currentData[14],
          p.fechaUltimaEntrada !== undefined ? p.fechaUltimaEntrada : currentData[15]
        ];
        
        rowRange.setValues([newRow]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Actualizado" })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Guarda y cliquea **Implementar > Nueva Implementación**.
4. Selecciona tipo **Aplicación web**.
5. Descripción: "API Inventario v1".
6. **Ejecutar como**: YO (Tu cuenta).
7. **Quién tiene acceso**: Cualquier persona. *(CRÍTICO para que el Frontend web pueda consumirlo sin login de Google)*.
8. Clica "Implementar" y autoriza los permisos.
9. **Copia la URL de la Aplicación web**.

---

## 2. Configuración del Repositorio y Entorno

### Entorno Local
Crea un archivo `.env` en la raíz de este proyecto con la URL de tu API:
```env
PUBLIC_API_URL="TU_URL_DE_APPS_SCRIPT_AQUI"
```

Luego ejecuta (Nota: Requiere Node.js instalado):
```bash
npm install
npm run dev
```

### Despliegue en GitHub Pages (Actions)
1. Ve a **Settings > Secrets and variables > Actions** en tu repositorio de GitHub.
2. Crea un **New repository secret**.
3. Name: `PUBLIC_API_URL`
4. Secret: *(Pega la URL de tu Google Apps Script)*
5. Ve a **Settings > Pages > Build and deployment**, selecciona **GitHub Actions** como source.

Si tu repositorio no es la página de usuario principal (es decir, no es `usuario.github.io`), sino un repositorio (`usuario.github.io/inventario`), asegúrate de descomentar y editar `base: '/nombre-de-tu-repo'` en tu `astro.config.mjs`.

El archivo de workflow de GitHub (.github/workflows/deploy.yml) ya está incluido en el proyecto; se disparará al hacer push a la rama `main` o `master`.
