import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { requireDashboardUser } from "../../../../middlewares/RequireDashboardUser.js";
import { getBingoJwtValidator } from "../middlewares/BingoJwtValidator.js";
import { getBingoAuthControllers, getBingoControllers } from "../controllers/controllersProvider.js";
import type { IBingoRepository } from "../repository/BingoRepository.js";

const getBingoRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = dependencyManager.resolve("jwtValidator") as IJwtValidator;
  const bingoRepository = dependencyManager.resolve("bingoRepository") as IBingoRepository;
  const dashboardAuth = [jwtValidator, requireDashboardUser];
  const participantAuth = [getBingoJwtValidator(bingoRepository)];

  const {
    listEventsAdmin,
    getEventAdmin,
    createEvent,
    updateEvent,
    activateEvent,
    reactivateEvent,
    closeEvent,
    deleteEvent,
    createStand,
    updateStand,
    deleteStand,
    listParticipantsAdmin,
    drawAdmin,
    getActiveEvent,
    joinEvent,
    getBoard,
    checkin,
  } = getBingoControllers(dependencyManager);

  const { loginWithGoogle, refresh } = getBingoAuthControllers(dependencyManager);

  const router = Router();

  // Public auth
  router.post("/bingo/auth/google", loginWithGoogle);
  router.post("/bingo/auth/refresh", refresh);

  // Admin
  router.get("/admin/bingo-events", dashboardAuth, listEventsAdmin);
  router.get("/admin/bingo-events/:id", dashboardAuth, getEventAdmin);
  router.post("/admin/bingo-events", dashboardAuth, createEvent);
  router.patch("/admin/bingo-events/:id", dashboardAuth, updateEvent);
  router.post("/admin/bingo-events/:id/activate", dashboardAuth, activateEvent);
  router.post("/admin/bingo-events/:id/reactivate", dashboardAuth, reactivateEvent);
  router.post("/admin/bingo-events/:id/close", dashboardAuth, closeEvent);
  router.delete("/admin/bingo-events/:id", dashboardAuth, deleteEvent);
  router.post("/admin/bingo-events/:id/stands", dashboardAuth, createStand);
  router.patch("/admin/bingo-events/:id/stands/:standId", dashboardAuth, updateStand);
  router.delete("/admin/bingo-events/:id/stands/:standId", dashboardAuth, deleteStand);
  router.get("/admin/bingo-events/:id/participants", dashboardAuth, listParticipantsAdmin);
  router.post("/admin/bingo-events/:id/draw", dashboardAuth, drawAdmin);

  // Participant
  router.get("/bingo/events/active", participantAuth, getActiveEvent);
  router.post("/bingo/events/:id/join", participantAuth, joinEvent);
  router.get("/bingo/events/:id/board", participantAuth, getBoard);
  router.post("/bingo/events/:id/checkin", participantAuth, checkin);

  return router;
};

export default getBingoRoutes;
