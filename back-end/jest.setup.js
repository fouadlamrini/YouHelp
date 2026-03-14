// Test-only env (do not use production secrets)
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.JWT_EXPIRES = "7d";
