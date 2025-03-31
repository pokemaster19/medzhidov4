const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { loadFiles } = require('@graphql-tools/load-files');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../frontend/shop')));
app.use(cors());
app.use(express.json());

async function startApolloServer() {
  try {
    const typeDefs = await loadFiles(path.join(__dirname, 'schema.graphql'));
    
    const resolvers = {
      Query: {
        products: async (_, { fields }) => {
          const data = await fs.promises.readFile(
            path.join(__dirname, '../data/products.json'),
            'utf8'
          );
          const products = JSON.parse(data);
          
          return fields 
            ? products.map(product => 
                Object.fromEntries(
                  Object.entries(product).filter(([key]) => fields.includes(key))
                )
              )
            : products;
        }
      }
    };

    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    
    app.use('/graphql', expressMiddleware(server));
    
    app.listen(port, () => {
      console.log(`Магазин запущен: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Ошибка инициализации сервера:', error);
  }
}

startApolloServer();