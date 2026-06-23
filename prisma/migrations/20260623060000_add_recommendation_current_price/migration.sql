-- Store the latest market price used when the recommendation was generated.
ALTER TABLE "RecommendationCard" ADD COLUMN "currentPrice" REAL;
