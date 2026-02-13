module.exports = {
  apps: [{
    name: "gatchina_zakroma",
    script: "./dist/index.js",
    cwd: "/var/www/gatchina_zakroma",
    env: {
      DATABASE_URL: "mysql://wpadmin:AsLasVegas%236@localhost:3306/gatchina_zakroma",
      NODE_ENV: "production",
      PORT: "3000",
      JWT_SECRET: "gatchina-zakroma-jwt-secret-key-2024",
      SMTP_HOST: "mail.gzakroma.ru",
      SMTP_PORT: "25",
      SMTP_NOREPLY_USER: "noreply@gzakroma.ru",
      SMTP_NOREPLY_PASS: "Noreply2024!Gz",
      SMTP_NOREPLY_FROM: "noreply@gzakroma.ru",
      SMTP_SALES_USER: "sales@gzakroma.ru",
      SMTP_SALES_PASS: "Sales2024!Gz",
      SMTP_SALES_FROM: "sales@gzakroma.ru",
      MANAGER_EMAIL: "sales@gzakroma.ru",
      PAYMO_API_KEY: "81e99231-3900-4235-a8a1-cd6184ceef36",
      PAYMO_SECRET_KEY: "x4sw24asro"
    }
  }]
};
