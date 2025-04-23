import('dotenv').then(dotenv => {
    dotenv.config();
    import('./server.js').then(({ default: Server }) => {
      const server = new Server(process.env.PORT);
      server.start();
    });
});