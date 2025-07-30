import { Hono } from 'hono';
import auth from './auth';
import quote from './quote';

const app = new Hono();

app.get('/', (c) => c.text('Hono backend is running! 🚀'));

app.route('/auth', auth);
app.route('/quote', quote);

export default app;
