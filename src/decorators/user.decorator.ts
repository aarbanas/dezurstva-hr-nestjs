import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (property: string, executionContext: ExecutionContext) => {
    const ctx = executionContext.getArgByIndex(1);
    return property ? ctx.req.user && ctx.req.user[property] : ctx.req.user;
  },
);
