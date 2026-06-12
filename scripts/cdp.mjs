// Drive the WXT dev browser over CDP (it's launched with
// --remote-debugging-port=9222, see wxt.config.ts). Zero deps — uses Node's
// built-in WebSocket (Node 22+).
//
//   node scripts/cdp.mjs nav <url>            navigate the HN tab (or first tab)
//   node scripts/cdp.mjs shot <out.png>       screenshot the HN tab
//   node scripts/cdp.mjs eval '<expression>'  evaluate JS in the HN tab

const PORT = process.env.CDP_PORT ?? 9222;

async function pickTarget() {
  const list = await (await fetch(`http://localhost:${PORT}/json/list`)).json();
  const pages = list.filter((t) => t.type === 'page' && !t.url.startsWith('devtools://'));
  return pages.find((t) => t.url.includes('ycombinator')) ?? pages[0];
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error('WebSocket connect failed'));
  });
  let nextId = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  return {
    send(method, params = {}) {
      const id = ++nextId;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((res, rej) =>
        pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))),
      );
    },
    close: () => ws.close(),
  };
}

const [, , cmd, arg] = process.argv;
const target = await pickTarget();
if (!target) {
  console.error('No page target found — is `pnpm dev` running?');
  process.exit(1);
}
const cdp = await connect(target.webSocketDebuggerUrl);

if (cmd === 'nav') {
  await cdp.send('Page.navigate', { url: arg });
  console.log(`navigating ${target.id} -> ${arg}`);
} else if (cmd === 'shot') {
  // Optional 3rd arg: "x,y,w,h" clip region (CSS px) for a zoomed crop.
  const clipArg = process.argv[4];
  const params = { format: 'png' };
  if (clipArg) {
    const [x, y, width, height] = clipArg.split(',').map(Number);
    params.clip = { x, y, width, height, scale: 3 };
  }
  const { data } = await cdp.send('Page.captureScreenshot', params);
  const { writeFileSync } = await import('node:fs');
  writeFileSync(arg, Buffer.from(data, 'base64'));
  console.log(`wrote ${arg}`);
} else if (cmd === 'eval') {
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: arg,
    returnByValue: true,
    awaitPromise: true,
  });
  console.log(JSON.stringify(result.value, null, 2));
} else {
  console.error('usage: node scripts/cdp.mjs nav|shot|eval <arg>');
  process.exit(1);
}
cdp.close();
