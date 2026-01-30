import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./underc0de-f1e15-39bd5639c220.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function test() {
  const token = await admin.app().options.credential.getAccessToken();
  console.log("ACCESS TOKEN:", token.access_token.slice(0, 25));
}

test().catch(console.error);
