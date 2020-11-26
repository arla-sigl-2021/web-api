import qs from "qs";

type ExtractPageOptionsResponse = {
  page: number;
  limit: number;
};

// Try to cast to the query option to a number;
// throws an error otherwise
const asNumber = (query: qs.ParsedQs, optionName: string) => {
  const queryOption = query[optionName];
  const invalidFormatError = new Error(
    `${optionName} needs to be a valid number`
  );

  if (typeof queryOption === "string") {
    const n = +queryOption;
    if (isNaN(n)) throw invalidFormatError;
    return n;
  } else {
    throw invalidFormatError;
  }
};

// Extracts `page` and `limit` from the request's
// URL query options
export const extractPageOptions = (
  query: qs.ParsedQs
): ExtractPageOptionsResponse => {
  const page = asNumber(query, "page");
  const limit = asNumber(query, "limit");

  if (page <= 0) {
    throw new Error("page needs to be a postive integer");
  }
  if (limit <= 0) {
    throw new Error("limit needs to be a positive integer");
  }

  return { page, limit };
};
