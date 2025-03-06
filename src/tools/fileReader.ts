import { z } from "zod";
import fs from "fs/promises";

// Define schemas for read_file and read_multiple_files
export const ReadFileArgsSchema = z.object({
  path: z.string(),
});

export const ReadMultipleFilesArgsSchema = z.object({
  paths: z.array(z.string()),
});

// Function to read a single file
export async function runReadFile(args: z.infer<typeof ReadFileArgsSchema>) {
  const parsed = ReadFileArgsSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments for read_file: ${parsed.error}`);
  }
  try {
    await fs.access(parsed.data.path); // Check if file exists
    const content = await fs.readFile(parsed.data.path, "utf-8");
    return { content: [{ type: "text", text: content }] };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error reading file ${parsed.data.path}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

// Function to read multiple files
export async function runReadMultipleFiles(
  args: z.infer<typeof ReadMultipleFilesArgsSchema>
) {
  const parsed = ReadMultipleFilesArgsSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments for read_multiple_files: ${parsed.error}`
    );
  }

  const results = await Promise.all(
    parsed.data.paths.map(async (filePath) => {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, "utf-8");
        return { filePath, content, isError: false };
      } catch (error) {
        return {
          filePath,
          content: error instanceof Error ? error.message : String(error),
          isError: true,
        };
      }
    })
  );

  return {
    content: results.map((result) => ({
      type: "text",
      text: result.isError
        ? `Error reading ${result.filePath}: ${result.content}`
        : `${result.filePath}:\n${result.content}\n---\n`,
    })),
  };
}
