import express from "express";
import qs from "qs";

type ExtractPageOptionsResponse = {
  page: number;
  limit: number;
};

// Try to cast to the query option to a number;
// throws an error otherwise
const asNumber = (query: qs.ParsedQs, optionName: string) => {
  const queryOption = query[optionName];

  if (typeof queryOption === "string") {
    return +queryOption;
  } else {
    throw new Error(`${optionName} query option needs to be an integer`);
  }
};

// Extracts `page` and `limit` from the request's
// URL query options
export const extractPageOptions = (
  request: express.Request
): ExtractPageOptionsResponse => {
  const page = asNumber(request.query, "page");
  const limit = asNumber(request.query, "limit");

  if (page <= 0) {
    throw new Error("page needs to be a postive integer");
  }
  if (limit <= 0) {
    throw new Error("limit needs to be a positive integer");
  }

  return { page, limit };
};
