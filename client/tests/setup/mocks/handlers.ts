import { rest } from "msw";

const API_BASE_URL = "http://localhost:8000/api";

export const handlers = [
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: "EMPLOYEE",
        },
        token: "mock-token",
      })
    );
  }),

  rest.get(`${API_BASE_URL}/employees`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        employees: [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            department: "Engineering",
            role: "EMPLOYEE",
          },
        ],
      })
    );
  }),

];
