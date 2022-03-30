import fs from "fs";
import path from "path";

import Ajv from "ajv";

const schemaFile = path.resolve("room-config-schema.json");
const schema = JSON.parse(fs.readFileSync(schemaFile) + "");

const ajv = new Ajv();
const validate = ajv.compile(schema);

export default validate;
