import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeEyeRouter from "./analyze-eye";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeEyeRouter);

export default router;
