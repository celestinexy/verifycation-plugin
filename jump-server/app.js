import server from "./index.js"

try {
    // 调用server对象的listen方法，启动服务器
    server.listen({
      port: 3001,
      host: '0.0.0.0' 
    }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1); 
  }
