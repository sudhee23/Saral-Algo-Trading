import { Hono } from 'hono';
import auth from './auth';

const app = new Hono();

app.get('/', (c) => c.text('Hono backend is running! 🚀'));

app.route('/auth', auth);

export default app;
