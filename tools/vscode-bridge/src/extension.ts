import * as vscode from 'vscode';
import { WebSocketServer, type WebSocket } from 'ws';

/**
 * Swarm Bridge — minimal VSCode extension.
 * Bridge server (lokal) bu extension'a 127.0.0.1:<port> üzerinden bağlanır.
 * Her mesaj: { id, type, payload, timestamp }
 * Her yanıt: { id, ok, data?, error? }
 *
 * Phase 0: Sadece iskelet — Phase 6'da handler'lar dolacak.
 */

let wss: WebSocketServer | null = null;
let statusBar: vscode.StatusBarItem;

function getConfig() {
  const cfg = vscode.workspace.getConfiguration('swarm');
  return {
    port: cfg.get<number>('bridgePort', 3001),
    panelUrl: cfg.get<string>('panelUrl', 'http://localhost:5173'),
  };
}

function setStatus(connected: boolean) {
  if (connected) {
    statusBar.text = '$(sync~spin) Swarm: Bağlı';
    statusBar.backgroundColor = undefined;
  } else {
    statusBar.text = '$(circle-slash) Swarm: Kapalı';
    statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  }
  statusBar.show();
}

async function getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  return context.secrets.get('swarm.bridgeApiKey');
}

function startServer(context: vscode.ExtensionContext) {
  if (wss) return;
  const { port } = getConfig();

  wss = new WebSocketServer({ host: '127.0.0.1', port });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[swarm-bridge] client connected');

    ws.on('message', async (raw) => {
      let msg: { id: string; type: string; payload?: unknown };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      const { id, type } = msg;

      if (type === 'ping') {
        const apiKey = await getApiKey(context);
        const provided = (msg.payload as { apiKey?: string } | undefined)?.apiKey;
        if (apiKey && provided !== apiKey) {
          ws.send(JSON.stringify({ id, ok: false, error: 'unauthorized' }));
          ws.close();
          return;
        }
        ws.send(
          JSON.stringify({
            id,
            ok: true,
            data: {
              version: vscode.version,
              workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null,
            },
          })
        );
        return;
      }

      // Phase 6'da handler'lar eklenecek (terminal:create, claude:execute, mcp:call-tool, vb.)
      ws.send(
        JSON.stringify({
          id,
          ok: false,
          error: `unknown type: ${type} (Phase 6'da implemente edilecek)`,
        })
      );
    });

    ws.on('close', () => {
      console.log('[swarm-bridge] client disconnected');
    });
  });

  wss.on('listening', () => {
    setStatus(true);
    vscode.window.showInformationMessage(
      `Swarm Bridge dinliyor: 127.0.0.1:${port}`
    );
  });

  wss.on('error', (err) => {
    setStatus(false);
    vscode.window.showErrorMessage(`Swarm Bridge hata: ${err.message}`);
  });
}

function stopServer() {
  if (!wss) return;
  wss.close();
  wss = null;
  setStatus(false);
}

export function activate(context: vscode.ExtensionContext) {
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'swarm.connect';
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand('swarm.connect', () => startServer(context)),
    vscode.commands.registerCommand('swarm.disconnect', () => stopServer()),
    vscode.commands.registerCommand('swarm.openPanel', () => {
      const { panelUrl } = getConfig();
      vscode.env.openExternal(vscode.Uri.parse(panelUrl));
    })
  );

  setStatus(false);
  startServer(context);
}

export function deactivate() {
  stopServer();
}
