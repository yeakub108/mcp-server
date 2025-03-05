import puppeteer from "puppeteer";
import { z } from "zod";
import path from "path";
import fs from "fs";
/**
 * Screenshot tool
 *   - Takes in either "url" (a full URL) or "relativePath" to open on localhost:3000
 *   - Returns a base64-encoded PNG screenshot
 */

export const screenshotToolName = "screenshot";
export const screenshotToolDescription =
  "Take a screenshot of a URL or a local path (relative URL appended to http://localhost:3000).";

export const ScreenshotToolSchema = z.object({
  url: z.string().optional(),
  relativePath: z.string().optional(),
  fullPathToScreenshot: z.string(),
});

export async function runScreenshotTool(
  args: z.infer<typeof ScreenshotToolSchema>,
) {
  // Determine final URL
  let finalUrl = args.url;
  if (!finalUrl) {
    if (!args.relativePath) {
      throw new Error("Must provide either 'url' or 'relativePath'");
    }
    finalUrl = `http://localhost:3000/${args.relativePath.replace(/^\//, "")}`;
  }
  const fullPathToScreenshot = path.resolve(args.fullPathToScreenshot);

  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(finalUrl);
  const screenshotBuffer = (await page.screenshot({
    fullPage: true,
  })) as Buffer;
  await browser.close();
  await fs.promises.writeFile(fullPathToScreenshot, screenshotBuffer);
  // Return the base64 representation
  return {
    content: [
      {
        type: "text",
        text: `Screenshot saved to ${fullPathToScreenshot}. Before continuing, you MUST ask the user to drag and drop the screenshot into the chat window.
        The path to the screenshot is ${fullPathToScreenshot}.`,
      },
    ],
  };
}
