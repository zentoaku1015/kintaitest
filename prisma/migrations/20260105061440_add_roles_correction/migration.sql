-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "modifiedAt" DATETIME,
    "modifiedBy" TEXT,
    "originalTimestamp" DATETIME,
    CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("id", "status", "storeId", "timestamp", "type", "userId") SELECT "id", "status", "storeId", "timestamp", "type", "userId" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "homeStoreId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    CONSTRAINT "User_homeStoreId_fkey" FOREIGN KEY ("homeStoreId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("code", "homeStoreId", "id", "name", "password") SELECT "code", "homeStoreId", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_code_key" ON "User"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
