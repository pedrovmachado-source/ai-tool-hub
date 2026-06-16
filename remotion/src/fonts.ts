import { loadFont as loadSerif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";

export const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const sans = loadSans("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).fontFamily;
