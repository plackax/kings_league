require("dotenv").config();
const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./endpoints.js"];

const doc = {
  info: {
    version: "0.0.1",
    title: "Kings League API",
    description: "API for Kings League",
  },
  host: process.env.HOSTNAME,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

swaggerAutogen(outputFile, endpointsFiles, doc);
