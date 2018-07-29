import { ApplicationLoader } from "loon";

new ApplicationLoader('<SERVER>', {rootDir: __dirname})
  .start()
  .then((server: any) => console.log(`server is up on ${server.address().port}`));

