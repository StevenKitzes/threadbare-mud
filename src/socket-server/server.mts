import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

const fastify = Fastify({
  logger: true
})
const port: number = 3030;

fastify.get('/health-check', async function healthCheckHandler(req: FastifyRequest, res: FastifyReply) {
  res.send({ message: "success" });
});

fastify.listen({ port })
  .then(() => console.log(`Running Fastify-based socket server on port ${port}.`))
  .catch((err) => {
    fastify.log.error(err)
    process.exit(1)
  });

export {}
