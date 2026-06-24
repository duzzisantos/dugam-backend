const cluster = require("cluster");
const os = require("os");

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} starting ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code) => {
    console.log(`Worker ${worker.process.pid} exited (code ${code}), restarting`);
    cluster.fork();
  });
} else {
  require("./app/index.js");
  console.log(`Worker ${process.pid} started`);
}
