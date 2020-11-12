const express = require("express");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const app = express();
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Two factor authentication" });
});

app.listen(5000, () => console.log("Server started on port 5000"));
