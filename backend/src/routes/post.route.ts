import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { Roles } from "@/defaults/role";
import { PostInteractionController } from "@/controllers/post-interraction.controller";

const postRouter = Router();
const postController = new PostController();
const interactionController = new PostInteractionController();
const authMiddleware = new AuthMiddleware();

postRouter.get("/", authMiddleware.isAuthenticated, postController.getPosts);

postRouter.get("/:id", authMiddleware.isAuthenticated, postController.getPostById);

postRouter.post("/", authMiddleware.isAuthenticated, authMiddleware.hasRole([Roles.HR, Roles.MANAGER, Roles.ADMIN]), postController.createPost);

postRouter.put(
  "/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRoleOrIsAuthor([Roles.MODERATOR, Roles.ADMIN], async (req) => {
    const post = await postController.findPostById(parseInt(req.params.id));
    return post?.authorId || -1;
  }),
  postController.updatePost,
);

postRouter.delete(
  "/:id",
  authMiddleware.isAuthenticated,
  (req, res, next) => {
    const allowedRoles = [Roles.MODERATOR, Roles.ADMIN];
    if (authMiddleware.hasRole(allowedRoles)(req, res, () => true)) {
      return next();
    }
    next();
  },
  postController.deletePost,
);

postRouter.get(
  "/:id/stats",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.MANAGER, Roles.ADMIN, Roles.EMPLOYEE, Roles.MANAGER]),
  postController.getPostStats,
);

postRouter.post(
  "/:postId/comments",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.EMPLOYEE, Roles.MANAGER, Roles.ADMIN, Roles.HR]),
  interactionController.createComment,
);

postRouter.post(
  "/:postId/reactions",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.EMPLOYEE, Roles.MANAGER, Roles.ADMIN]),
  interactionController.toggleReaction,
);

postRouter.post(
  "/:postId/likes",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.EMPLOYEE, Roles.MANAGER, Roles.ADMIN, Roles.HR]),
  interactionController.toggleLike,
);

postRouter.post(
  "/comments/:commentId/replies",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.EMPLOYEE, Roles.MANAGER, Roles.ADMIN, Roles.HR]),
  interactionController.createCommentReply,
);

postRouter.get("/comments/:commentId/replies", authMiddleware.isAuthenticated, interactionController.getCommentReplies);

postRouter.get("/replies/:replyId/replies", authMiddleware.isAuthenticated, interactionController.getReplyReplies);

postRouter.post(
  "/comments/:commentId/likes",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.EMPLOYEE, Roles.MANAGER, Roles.ADMIN, Roles.HR]),
  interactionController.toggleCommentLike,
);

postRouter.post(
  "/replies/:replyId/likes",
  authMiddleware.isAuthenticated,
  authMiddleware.hasRole([Roles.EMPLOYEE, Roles.MANAGER, Roles.ADMIN, Roles.HR]),
  interactionController.toggleCommentLike,
);

export default postRouter;
