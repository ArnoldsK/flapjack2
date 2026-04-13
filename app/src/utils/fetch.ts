import type z from "zod";

/**
 * Node fetch with Zod parsing
 */
export const fetchData = async <Schema extends z.ZodType>(
  url: string | URL,
  schema: Schema,
  options?: RequestInit,
): Promise<z.infer<Schema>> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `Unable to fetch data from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error(`Unable to parse JSON response from ${url}`);
  }

  try {
    return schema.parse(data);
  } catch {
    throw new Error(`Response from ${url} did not match expected schema`);
  }
};
