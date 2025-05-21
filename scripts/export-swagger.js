import swaggerSpec from "../src/utils/swagger.js";
import fs from "fs";

fs.writeFileSync("swagger.json", JSON.stringify(swaggerSpec, null, 2));
console.log("Swagger spec exported to swagger.json");
