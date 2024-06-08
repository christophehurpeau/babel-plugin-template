import { createCheckPackage } from "check-package-dependencies";

await createCheckPackage({ isLibrary: false }).checkRecommended({}).run();
