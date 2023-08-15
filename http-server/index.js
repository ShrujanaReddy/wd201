const http = require("http");
const fs = require("fs");

const args = require("minimist")(process.argv.slice(2))
const port=args.port||3000;

let homeContent = "";
let projectContent = "";
let regContent="";

fs.readFile("home.html", (err, home) => {
  if (err) {
    throw err;
  }
  homeContent = home;
});

fs.readFile("project.html", (err, project) => {
  if (err) {
    throw err;
  }
  projectContent = project;
});

fs.readFile("registration.html", (err, reg) => {
  if (err) {
    throw err;
  }
  regContent = reg;
});


http
  .createServer((request, response) => {
    let url = request.url;
    response.writeHeader(200, { "Content-Type": "text/html" });
    switch (url) {
      case "/project":
        response.write(projectContent);
        response.end();
        break;
      case "/registration" :
        response.write(regContent);
        response.end();
        break;
      case "/" :
        response.write(homeContent);
        response.end();
        break;
    }
  })
  .listen(port);