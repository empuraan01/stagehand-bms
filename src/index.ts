import { Stagehand , type LogLine } from "@browserbasehq/stagehand";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();


function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function main(){
const stagehand = new Stagehand({
    env : "BROWSERBASE",
    apiKey: requireEnv("BROWSERBASE_API_KEY"),
    projectId: requireEnv("BROWSERBASE_PROJECT_ID"),
    verbose : 2,
    enableCaching: false,
		logger: (logLine: LogLine) => {
			console.log(`[${logLine.category}] ${logLine.message}`);
		},
    modelName: "google/gemini-2.0-flash",
    modelClientOptions: {
      apiKey: requireEnv("GOOGLE_GENERATIVE_AI_API_KEY"),
    },
    waitForCaptchaSolves: true,
    browserbaseSessionCreateParams: {
      projectId: requireEnv("BROWSERBASE_PROJECT_ID"),
      browserSettings: {
        advancedStealth: false,
        blockAds: true,
        solveCaptchas: true,
      },
    },
});

try{
    await stagehand.init();
    console.log("Stagehand initialized");

    const page = stagehand.page;
    await page.goto("https://in.bookmyshow.com/explore/events-bengaluru?daygroups=tomorrow&categories=workshops|comedy-shows|music-shows|meetups|performances|screening|spirituality|exhibitions|talks")

    const result = await page.extract({
        instruction : "tell me the name of the first event you see",
        schema : z.object({
            title : z.string(),
        })
    });

    console.log("Result : ", result);

} catch(error){
    console.error("Stagehand : ", error);
} finally{
    try {
        await stagehand.close();
    } catch (closeError) {
        console.warn("Stagehand close skipped:", closeError);
    }
}
}

main();