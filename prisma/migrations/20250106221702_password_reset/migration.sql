-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "token_expiry" BIGINT NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("user_id","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
