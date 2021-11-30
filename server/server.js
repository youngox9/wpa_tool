const fs = require('fs').promises;
const Koa = require('koa');
const route = require('koa-route');
const websockify = require('koa-websocket');
var Router = require('koa-router');
const cors = require('@koa/cors');
const WebSocket = require('ws')
const koaBody = require('koa-body');
const FileReader = require('filereader')



const app = websockify(new Koa());
const router = new Router();
const wss = new WebSocket.Server({ port: 8887 });

wss.on('connection', (ws) => {
  /**
   * send the newest data to client
   */
  brocast();

  ws.on('message', async (message) => {
    const { type, data = {} } = JSON.parse(message.toString())

    const fileData = await getDataJSON();
    if (type === 'capture') {
      const { key = '' } = data;
      // if (!key) { return }
      if (!fileData[key]) {
        await setDataJSON({ ...fileData, [key]: '' })
      }
    } else if (type === 'save') {
      await setDataJSON({ ...fileData, ...data });
    } else if (type === 'clear') {
      await clearData();
    } else {

    }
    await brocast();

  })

  ws.on('close', function () {
    // console.log("lost client")
  })
  ws.on('OPEN', function () {
    // console.log("open client");
  })
})


async function brocast() {
  const data = await getDataJSON();
  wss.clients.forEach(function each(client) {
    const tmp = { type: 'brocast', data };
    const msg = JSON.stringify(tmp)
    client.send(msg);
  });
}

async function getDataJSON() {
  const temp = await fs.readFile('./data.json', 'utf8');
  const data = JSON.parse(temp);
  return data;
}

async function setDataJSON(data = {}) {
  const tmp = await getDataJSON();
  const message = JSON.stringify({ ...data });
  await fs.writeFile('./data.json', message)
}

async function clearData() {
  await fs.writeFile('./data.json', "{}")
}


app.use(koaBody());
app.use(router.routes())
app.use(router.allowedMethods())


router
  .get('/', async (ctx) => {
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    } catch (e) { }
    ctx.body = {
      data
    };
  })
  .post('/', async (ctx) => {
    const data = ctx.request.body.data;
    const message = JSON.stringify(data);
    fs.writeFileSync('./data.json', message, (err) => {
      if (err) throw err
    })
    brocast();
  })
  .post('/capture', async (ctx) => {
    const key = ctx.request.body.data.key;
    const data = getDataJSON();
    const temp = { ...data, [key]: "" };
    setDataJSON(temp);
    ctx.status = 200;
  })


app.use(cors({
  origin: '*'
}))
app.listen(8888);