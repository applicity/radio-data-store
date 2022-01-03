import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./schema/typeDefs";
import resolvers from "./schema/resolvers";
import getDb from './data';

// import generateTodoModel from "./schema/models";
// import dbConnection from "./db/connection";
import cors from "cors"
const startApolloServer = async () => {
  // await dbConnection()
  //   .then((result) => console.log(result))
  //   .catch((err) => console.log(err));
  const app = express();
  app.use(cors())
  // app.use((req, res, next) => { console.log(req); if (req.body) console.log(JSON.stringify(req.body)); next()});
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, res }) => {
      return {
        req,
        res,
        db: await getDb(),
        // db, //Here it is
      }
    },
    // context: ({ req }) => {
    //   return {
    //     models: {
    //       Todo: generateTodoModel(),
    //     },
    //   };
    // },
  });
  await server.start();
  server.applyMiddleware({ app });
  app.use((req, res) => {
    res.status(200);
    res.send("Welcome Todo App");
    res.end();
  });
  await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return { server, app };
};
startApolloServer();