"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbQueryResultCache = void 0;
var tslib_1 = require("tslib");
var OracleDriver_1 = require("../driver/oracle/OracleDriver");
var MssqlParameter_1 = require("../driver/sqlserver/MssqlParameter");
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var Table_1 = require("../schema-builder/table/Table");
/**
 * Caches query result into current database, into separate table called "query-result-cache".
 */
var DbQueryResultCache = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function DbQueryResultCache(connection) {
        this.connection = connection;
        var schema = this.connection.driver.options.schema;
        var database = this.connection.driver.database;
        var cacheOptions = typeof this.connection.options.cache === "object" ? this.connection.options.cache : {};
        var cacheTableName = cacheOptions.tableName || "query-result-cache";
        this.queryResultCacheDatabase = database;
        this.queryResultCacheSchema = schema;
        this.queryResultCacheTable = this.connection.driver.buildTableName(cacheTableName, schema, database);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a connection with given cache provider.
     */
    DbQueryResultCache.prototype.connect = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Disconnects with given cache provider.
     */
    DbQueryResultCache.prototype.disconnect = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Creates table for storing cache if it does not exist yet.
     */
    DbQueryResultCache.prototype.synchronize = function (queryRunner) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var driver, tableExist;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.getQueryRunner(queryRunner);
                        driver = this.connection.driver;
                        return [4 /*yield*/, queryRunner.hasTable(this.queryResultCacheTable)];
                    case 1:
                        tableExist = _a.sent();
                        if (tableExist)
                            return [2 /*return*/];
                        return [4 /*yield*/, queryRunner.createTable(new Table_1.Table({
                                database: this.queryResultCacheDatabase,
                                schema: this.queryResultCacheSchema,
                                name: this.queryResultCacheTable,
                                columns: [
                                    {
                                        name: "id",
                                        isPrimary: true,
                                        isNullable: false,
                                        type: driver.normalizeType({ type: driver.mappedDataTypes.cacheId }),
                                        generationStrategy: "increment",
                                        isGenerated: true
                                    },
                                    {
                                        name: "identifier",
                                        type: driver.normalizeType({ type: driver.mappedDataTypes.cacheIdentifier }),
                                        isNullable: true
                                    },
                                    {
                                        name: "time",
                                        type: driver.normalizeType({ type: driver.mappedDataTypes.cacheTime }),
                                        isPrimary: false,
                                        isNullable: false
                                    },
                                    {
                                        name: "duration",
                                        type: driver.normalizeType({ type: driver.mappedDataTypes.cacheDuration }),
                                        isPrimary: false,
                                        isNullable: false
                                    },
                                    {
                                        name: "query",
                                        type: driver.normalizeType({ type: driver.mappedDataTypes.cacheQuery }),
                                        isPrimary: false,
                                        isNullable: false
                                    },
                                    {
                                        name: "result",
                                        type: driver.normalizeType({ type: driver.mappedDataTypes.cacheResult }),
                                        isNullable: false
                                    },
                                ]
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Caches given query result.
     * Returns cache result if found.
     * Returns undefined if result is not cached.
     */
    DbQueryResultCache.prototype.getFromCache = function (options, queryRunner) {
        queryRunner = this.getQueryRunner(queryRunner);
        var qb = this.connection
            .createQueryBuilder(queryRunner)
            .select()
            .from(this.queryResultCacheTable, "cache");
        if (options.identifier) {
            return qb
                .where(qb.escape("cache") + "." + qb.escape("identifier") + " = :identifier")
                .setParameters({ identifier: this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver ? new MssqlParameter_1.MssqlParameter(options.identifier, "nvarchar") : options.identifier })
                .getRawOne();
        }
        else if (options.query) {
            if (this.connection.driver instanceof OracleDriver_1.OracleDriver) {
                return qb
                    .where("dbms_lob.compare(" + qb.escape("cache") + "." + qb.escape("query") + ", :query) = 0", { query: options.query })
                    .getRawOne();
            }
            return qb
                .where(qb.escape("cache") + "." + qb.escape("query") + " = :query")
                .setParameters({ query: this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver ? new MssqlParameter_1.MssqlParameter(options.query, "nvarchar") : options.query })
                .getRawOne();
        }
        return Promise.resolve(undefined);
    };
    /**
     * Checks if cache is expired or not.
     */
    DbQueryResultCache.prototype.isExpired = function (savedCache) {
        var duration = typeof savedCache.duration === "string" ? parseInt(savedCache.duration) : savedCache.duration;
        return ((typeof savedCache.time === "string" ? parseInt(savedCache.time) : savedCache.time) + duration) < new Date().getTime();
    };
    /**
     * Stores given query result in the cache.
     */
    DbQueryResultCache.prototype.storeInCache = function (options, savedCache, queryRunner) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var insertedValues, qb, qb;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.getQueryRunner(queryRunner);
                        insertedValues = options;
                        if (this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) { // todo: bad abstraction, re-implement this part, probably better if we create an entity metadata for cache table
                            insertedValues = {
                                identifier: new MssqlParameter_1.MssqlParameter(options.identifier, "nvarchar"),
                                time: new MssqlParameter_1.MssqlParameter(options.time, "bigint"),
                                duration: new MssqlParameter_1.MssqlParameter(options.duration, "int"),
                                query: new MssqlParameter_1.MssqlParameter(options.query, "nvarchar"),
                                result: new MssqlParameter_1.MssqlParameter(options.result, "nvarchar"),
                            };
                        }
                        if (!(savedCache && savedCache.identifier)) return [3 /*break*/, 2];
                        qb = queryRunner.manager
                            .createQueryBuilder()
                            .update(this.queryResultCacheTable)
                            .set(insertedValues);
                        qb.where(qb.escape("identifier") + " = :condition", { condition: insertedValues.identifier });
                        return [4 /*yield*/, qb.execute()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(savedCache && savedCache.query)) return [3 /*break*/, 4];
                        qb = queryRunner.manager
                            .createQueryBuilder()
                            .update(this.queryResultCacheTable)
                            .set(insertedValues);
                        if (this.connection.driver instanceof OracleDriver_1.OracleDriver) {
                            qb.where("dbms_lob.compare(\"query\", :condition) = 0", { condition: insertedValues.query });
                        }
                        else {
                            qb.where(qb.escape("query") + " = :condition", { condition: insertedValues.query });
                        }
                        return [4 /*yield*/, qb.execute()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: // otherwise insert
                    return [4 /*yield*/, queryRunner.manager
                            .createQueryBuilder()
                            .insert()
                            .into(this.queryResultCacheTable)
                            .values(insertedValues)
                            .execute()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clears everything stored in the cache.
     */
    DbQueryResultCache.prototype.clear = function (queryRunner) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.getQueryRunner(queryRunner).clearTable(this.queryResultCacheTable)];
            });
        });
    };
    /**
     * Removes all cached results by given identifiers from cache.
     */
    DbQueryResultCache.prototype.remove = function (identifiers, queryRunner) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(identifiers.map(function (identifier) {
                            var qb = _this.getQueryRunner(queryRunner).manager.createQueryBuilder();
                            return qb.delete()
                                .from(_this.queryResultCacheTable)
                                .where(qb.escape("identifier") + " = :identifier", { identifier: identifier })
                                .execute();
                        }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Gets a query runner to work with.
     */
    DbQueryResultCache.prototype.getQueryRunner = function (queryRunner) {
        if (queryRunner)
            return queryRunner;
        return this.connection.createQueryRunner();
    };
    return DbQueryResultCache;
}());
exports.DbQueryResultCache = DbQueryResultCache;

//# sourceMappingURL=DbQueryResultCache.js.map
