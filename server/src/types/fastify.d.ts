import 'fastify';

type JwtPayload = { sub: string; role: string };

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    accessVerify: () => Promise<void>;
    accessSign: (payload: Record<string, unknown>) => Promise<string>;
    refreshVerify: () => Promise<void>;
    refreshSign: (payload: Record<string, unknown>) => Promise<string>;
    user: JwtPayload;
  }

  interface FastifyReply {
    accessSign: (payload: Record<string, unknown>) => Promise<string>;
    refreshSign: (payload: Record<string, unknown>) => Promise<string>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
