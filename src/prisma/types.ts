export type FindResponse<T> = {
  data: T[];
  meta: {
    skip: number;
    take: number;
    count: number;
  };
};
