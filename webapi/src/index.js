const http = require("http");

const HeroFactory = require("./factories/hero.factory");
const Hero = require("./entities/hero.entity");

const PORT = 3333;
const DEFAULT_HEADER = { "Content-Type": "application/json" };

const heroService = HeroFactory.generateInstance();

const routes = {
  "/heroes:get": async (request, response) => {
    const { id } = request.queryString;
    const heroes = await heroService.find(id);

    response.write(JSON.stringify({ results: heroes }));

    return response.end();
  },
  "/heroes:post": async (request, response) => {
    for await (const data of request) {
      try {
        const item = JSON.parse(data);
        const hero = new Hero(item);
        const { error, valid } = hero.isInvalid();

        if (!valid) {
          response.writeHead(400, DEFAULT_HEADER);
          response.write(JSON.stringify({ error: error.join(",") }));

          return response.end();
        }

        const id = await heroService.create(hero);

        response.writeHead(201, DEFAULT_HEADER);
        response.write(
          JSON.stringify({ succes: "User create with success ", id })
        );

        // só jogamos um returna aqui, pois sabemos que é um obejto body por requisição
        // se fosse um arquivo, que sobe sob demanda
        // ele poderia entrar mais vezes em um mesmo evento, ai removeriamos o return

        return response.end();
      } catch (error) {
        return handleError(response)(error);
      }
    }
  },
  default: (request, response) => {
    response.write("Hello");
    response.end();
  },
};

const handleError = (response) => {
  return (error) => {
    response.writeHead(500, DEFAULT_HEADER);
    response.write(JSON.stringify({ error: "Internal server error", id }));

    return response.end();
  };
};

const handler = (request, response) => {
  const { url, method } = request;
  const [_, route, id] = url.split("/");

  request.queryString = { id: isNaN(id) ? id : Number(id) };

  const key = `/${route}:${method.toLowerCase()}`;

  response.writeHead(200, DEFAULT_HEADER);

  const chosen = routes[key] || routes.default;

  return chosen(request, response).catch(handleError(response));
};

http
  .createServer(handler)
  .listen(PORT, () => console.log("Server running at", PORT));
