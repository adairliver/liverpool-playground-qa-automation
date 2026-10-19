// Extension integrada (sin red, sin telemetria) que prepara el IDE web al abrir el proyecto del reto.
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

exports.activate = async function activate() {
  await aplicarAjustes();
  await cerrarBienvenida();
  await abrirTerminal();
  await cerrarBienvenida();
};
exports.deactivate = function deactivate() {};
