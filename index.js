const express = require("express");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const dbConfig = new Config("myDb", true, false, "/");
const db = new JsonDB(dbConfig);

const app = express();
app.use(express.json());
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Two factor authentication" });
});

// create user and temp secret
app.post("/api/register", (req, res) => {
  const id = uuid.v4();
  try {
    const tempSecret = speakeasy.generateSecret();
    const path = `/users/${id}`;
    db.push(path, { id, tempSecret });
    res.status(201).json({ id, secret: tempSecret.base32 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error generating secret." });
  }
});

// verify secret token
app.post("/api/verify", (req, res) => {
  const { id, token } = req.body;
  try {
    const path = `/users/${id}`;
    const user = db.getData(path);
    const { base32: secret } = user.tempSecret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });

    if (verified) {
      db.push(path, { id, secret: user.tempSecret });
    }
    res.status(200).json({ verified });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error finding user." });
  }
});

// validate token
app.post("/api/validate", (req, res) => {
  const { id, token } = req.body;
  try {
    const path = `/users/${id}`;
    const user = db.getData(path);
    const { base32: secret } = user.secret;
    const validated = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    res.status(200).json({ validated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error finding user." });
  }
});

app.listen(5000, () => console.log("Server started on port 5000"));
