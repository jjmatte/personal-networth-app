// Deterministic offline stand-in for the Twelve Data price API, used by e2e.
// Every /price request returns a fixed $100 so tests never touch the network.
// Point the app at it with PRICE_API_BASE=http://localhost:<port>.
import { createServer } from 'node:http';

const port = Number(process.env.PRICE_STUB_PORT ?? 4399);

createServer((req, res) => {
	res.writeHead(200, { 'content-type': 'application/json' });
	if (req.url?.startsWith('/price')) {
		res.end(JSON.stringify({ price: '100' }));
	} else {
		res.end(JSON.stringify({ ok: true }));
	}
}).listen(port, () => console.log(`price stub listening on ${port}`));
