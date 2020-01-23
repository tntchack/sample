const production = process.env.NODE_ENV === 'production'

export default {
  production,
  package: {
    name: process.env.npm_package_name,
    version: process.env.npm_package_version,
  },
  server: {
    host: production ? 'localhost' : undefined, // all IPs
    port: 4261,
  },
  postgres: {
    user: "weblite", 
    password: "allmosts",    
    host: "localhost",
    port: "5432",
    database: "weblite"
  },
  pathToFile: './src/setup/reasons.json'
}
