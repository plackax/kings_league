require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const cors = require("cors");

const app = express();
app.use(cors());

app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
require("./endpoints")(app);
