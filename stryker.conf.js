module.exports = function(config) {
  config.set({
    mutator: "typescript",
    packageManager: "yarn",
    reporters: ["clear-text", "progress", "dashboard"],
    testRunner: "jest",
    transpilers: [],
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    mutate: ["lib/**/*.ts"]
  });
};
