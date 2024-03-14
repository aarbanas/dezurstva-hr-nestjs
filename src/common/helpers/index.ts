import * as mime from 'mime-types';

export const resolveContentType = (
  filenameOrExt: string,
): string | undefined => {
  const contentType = mime.contentType(filenameOrExt);

  if (contentType === false) {
    return undefined;
  }

  return contentType;
};
