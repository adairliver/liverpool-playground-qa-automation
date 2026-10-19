// Extension integrada (sin red, sin telemetria) que prepara el IDE web al abrir el proyecto del reto:
// tema oscuro, sin Welcome, terminal desplegada y, si existe, el video del estado esperado como primera pestana.
// Los ajustes de usuario del IDE web viven en el navegador; por eso se aplican desde aqui en vez de un archivo del servidor.
const vscode = require('vscode');

const DEFAULTS = {
  'workbench.colorTheme': 'Default Dark Modern',
  'window.autoDetectColorScheme': false,
  'workbench.startupEditor': 'none',
  'workbench.tips.enabled': false,
};

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function aplicarAjustes() {
  const cfg = vscode.workspace.getConfiguration();
  for (const [clave, valor] of Object.entries(DEFAULTS)) {
    const info = cfg.inspect(clave);
    // Solo si el usuario no lo ha cambiado nunca.
    if (info && info.globalValue === undefined) {
      try { await cfg.update(clave, valor, vscode.ConfigurationTarget.Global); } catch (e) { /* no critico */ }
    }
  }
}

async function cerrarBienvenida() {
  for (const grupo of vscode.window.tabGroups.all) {
    for (const tab of grupo.tabs) {
      if (/^(welcome|bienvenid)/i.test(tab.label)) {
        try { await vscode.window.tabGroups.close(tab); } catch (e) { /* no critico */ }
      }
    }
  }
}

async function abrirTerminal() {
  // Si el IDE restauro una terminal de la sesion anterior, solo se muestra; si no, se crea una.
  await esperar(2500);
  if (vscode.window.terminals.length === 0) {
    await vscode.commands.executeCommand('workbench.action.terminal.new');
  } else {
    await vscode.commands.executeCommand('workbench.action.terminal.focus');
  }
}

// Si el proyecto trae el video del estado esperado (imagen del reto), lo abre como PRIMERA pestana y deja el README
// al lado. Solo si no hay otras pestanas abiertas: si el candidato recarga y el IDE restaura su trabajo, no se toca nada.
async function abrirReferencia() {
  const carpetas = vscode.workspace.workspaceFolders;
  if (!carpetas || carpetas.length === 0) return;
  const raiz = carpetas[0].uri;
  const video = vscode.Uri.joinPath(raiz, 'referencia', 'estado-esperado.mp4');
  try { await vscode.workspace.fs.stat(video); } catch (e) { return; } // imagen sin video: nada que abrir
  await esperar(1500);
  const abiertas = vscode.window.tabGroups.all.reduce((n, g) => n + g.tabs.length, 0);
  if (abiertas > 0) return;
  try {
    await vscode.commands.executeCommand('vscode.open', video, { preview: false });
    // La vista previa del README se abre como segunda pestana y toma el foco; se vuelve a activar el video.
    await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.joinPath(raiz, 'README.md'));
    await vscode.commands.executeCommand('vscode.open', video, { preview: false });
  } catch (e) { /* no critico */ }
}

exports.activate = async function activate() {
  await aplicarAjustes();
  await cerrarBienvenida();
  await abrirTerminal();
  await cerrarBienvenida();
  await abrirReferencia();
};
exports.deactivate = function deactivate() {};
