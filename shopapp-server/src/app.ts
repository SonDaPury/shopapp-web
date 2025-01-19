import express, { Request, Response } from "express";
import { configs } from "./configs/configs";
import morgan from "morgan";

const app = express();

// Middleware
app.use(
  morgan("combined", {
    stream: {
      write: (mes: string) => configs.logger.http(mes.trim()),
    },
  })
);
app.use(express.json());

// Routes
app.get("/api", (req: Request, res: Response) => {
  res.send("Hello World");
});

// Start server
app.listen(configs.env.port, () => {
  console.log(
    `Server is running on host: http://localhost:${configs.env.port}`
  );
});
