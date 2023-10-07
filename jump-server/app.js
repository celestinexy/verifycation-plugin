
import server from "./index.js"

try {
    server();
  } catch (err) {
    console.error(err);
    process.exit(1); 
  }