const { defineConfig } = require("cypress");
  
module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  env: {
    email: "lizab@test.com",
    password: "123456",
    apiUrl: "https://conduit-api.bondaracademy.com"
  },
  retries: {
    runMode: 2,
    openMode: 1
  },
  e2e: {
    setupNodeEvents(on, config) {
      const email = process.env.DB_EMAIL
      const password = process.env.PASSWORD
      // if(!password){
      //   throw new Error('missing PASSWORD env variable')
      // }
      config.env = {email, password}
      return config
    },
    baseUrl: 'https://conduit.bondaracademy.com/',
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}'
  },
  reporter: 'cypress-multi-reporters, mochawesome',
  reporterOptions: {
    configFile: 'reporter-config.json',
    reportDir: 'cypress/results/mochawesome',
    overwrite: false,
    html: false,
    json: true,
  },
});
