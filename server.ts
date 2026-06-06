import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { v4 as uuidv4 } from 'uuid';
import { User, Message } from './src/types';

// ==========================================
// SIMULATED IN-MEMORY DATABASE
// ==========================================
const db = {
  users: new Map<string, User>(), // key: username
  usersById: new Map<string, User>(), // key: user ID
  usersByLinkId: new Map<string, User>(), // key: linkId
  messages: new Map<string, Message[]>(), // key: userId
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API ROUTES
  // ==========================================

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Register a new user
  app.post('/api/auth/register', (req, res) => {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const un = username.trim().toLowerCase();
    
    if (db.users.has(un)) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const id = uuidv4();
    const linkId = uuidv4().substring(0, 8); // Short link

    const newUser: User = { id, username: un, linkId };
    
    db.users.set(un, newUser);
    db.usersById.set(id, newUser);
    db.usersByLinkId.set(linkId, newUser);
    db.messages.set(id, []); // Initialize empty inbox

    res.json({ user: newUser });
  });

  // Login a user
  app.post('/api/auth/login', (req, res) => {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const un = username.trim().toLowerCase();
    const user = db.users.get(un);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  });

  // Get user details by Link ID (Public info for sending message)
  app.get('/api/links/:linkId', (req, res) => {
    const { linkId } = req.params;
    const user = db.usersByLinkId.get(linkId);

    if (!user) {
      return res.status(404).json({ error: 'Enlace no válido' });
    }

    // Only return username, hide the rest
    res.json({ username: user.username });
  });

  // Send an anonymous message
  app.post('/api/messages/:linkId', (req, res) => {
    const { linkId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    const user = db.usersByLinkId.get(linkId);
    
    if (!user) {
      return res.status(404).json({ error: 'Enlace no válido' });
    }

    const newMessage: Message = {
      id: uuidv4(),
      userId: user.id,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    const userMessages = db.messages.get(user.id) || [];
    userMessages.unshift(newMessage); // Insert at beginning
    db.messages.set(user.id, userMessages);

    res.json({ success: true, message: 'Mensaje enviado!' });
  });

  // Get user's messages
  app.get('/api/messages', (req, res) => {
    // In a real app we would use JWT or sessions.
    // For this prototype, we'll expect user ID in a header.
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const userMessages = db.messages.get(userId) || [];
    res.json({ messages: userMessages });
  });

  // Delete all messages for a user
  app.delete('/api/messages', (req, res) => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    db.messages.set(userId, []);
    res.json({ success: true, message: 'Mensajes eliminados' });
  });

  // Delete user account
  app.delete('/api/users', (req, res) => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = db.usersById.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    db.users.delete(user.username);
    db.usersById.delete(user.id);
    db.usersByLinkId.delete(user.linkId);
    db.messages.delete(user.id);

    res.json({ success: true, message: 'Cuenta eliminada' });
  });


  // ==========================================
  // VITE MIDDLEWARE & STATIC FILES
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In Express 5 req.params is required for splat, but express 4 
    // is in use. express v4 compatible way:
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
