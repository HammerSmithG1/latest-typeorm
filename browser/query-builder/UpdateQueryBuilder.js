import { __awaiter, __extends, __generator, __read, __spreadArray, __values } from "tslib";
import { CockroachDriver } from "../driver/cockroachdb/CockroachDriver";
import { SapDriver } from "../driver/sap/SapDriver";
import { QueryBuilder } from "./QueryBuilder";
import { SqlServerDriver } from "../driver/sqlserver/SqlServerDriver";
import { PostgresDriver } from "../driver/postgres/PostgresDriver";
import { UpdateResult } from "./result/UpdateResult";
import { ReturningStatementNotSupportedError } from "../error/ReturningStatementNotSupportedError";
import { ReturningResultsEntityUpdator } from "./ReturningResultsEntityUpdator";
import { MysqlDriver } from "../driver/mysql/MysqlDriver";
import { BroadcasterResult } from "../subscriber/BroadcasterResult";
import { LimitOnUpdateNotSupportedError } from "../error/LimitOnUpdateNotSupportedError";
import { OracleDriver } from "../driver/oracle/OracleDriver";
import { UpdateValuesMissingError } from "../error/UpdateValuesMissingError";
import { EntityColumnNotFound } from "../error/EntityColumnNotFound";
import { AuroraDataApiDriver } from "../driver/aurora-data-api/AuroraDataApiDriver";
import { TypeORMError } from "../error";
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var UpdateQueryBuilder = /** @class */ (function (_super) {
    __extends(UpdateQueryBuilder, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function UpdateQueryBuilder(connectionOrQueryBuilder, queryRunner) {
        var _this = _super.call(this, connectionOrQueryBuilder, queryRunner) || this;
        _this.expressionMap.aliasNamePrefixingEnabled = false;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    UpdateQueryBuilder.prototype.getQuery = function () {
        var sql = this.createComment();
        sql += this.createUpdateExpression();
        sql += this.createOrderByExpression();
        sql += this.createLimitExpression();
        return sql.trim();
    };
    /**
     * Executes sql generated by query builder and returns raw database results.
     */
    UpdateQueryBuilder.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, transactionStartedByUs, broadcastResult, declareSql, selectOutputSql, returningResultsEntityUpdator, returningColumns_1, _a, _b, columnPath, _c, updateSql, parameters, statements, queryResult, updateResult, broadcastResult, error_1, rollbackError_1;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        queryRunner = this.obtainQueryRunner();
                        transactionStartedByUs = false;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 13, 18, 21]);
                        if (!(this.expressionMap.useTransaction === true && queryRunner.isTransactionActive === false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, queryRunner.startTransaction()];
                    case 2:
                        _e.sent();
                        transactionStartedByUs = true;
                        _e.label = 3;
                    case 3:
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 5];
                        broadcastResult = new BroadcasterResult();
                        queryRunner.broadcaster.broadcastBeforeUpdateEvent(broadcastResult, this.expressionMap.mainAlias.metadata, this.expressionMap.valuesSet);
                        if (!(broadcastResult.promises.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(broadcastResult.promises)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        declareSql = null;
                        selectOutputSql = null;
                        returningResultsEntityUpdator = new ReturningResultsEntityUpdator(queryRunner, this.expressionMap);
                        returningColumns_1 = [];
                        if (Array.isArray(this.expressionMap.returning) && this.expressionMap.mainAlias.hasMetadata) {
                            try {
                                for (_a = __values(this.expressionMap.returning), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    columnPath = _b.value;
                                    returningColumns_1.push.apply(returningColumns_1, __spreadArray([], __read(this.expressionMap.mainAlias.metadata.findColumnsWithPropertyPath(columnPath))));
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                        if (this.expressionMap.updateEntity === true &&
                            this.expressionMap.mainAlias.hasMetadata &&
                            this.expressionMap.whereEntities.length > 0) {
                            this.expressionMap.extraReturningColumns = returningResultsEntityUpdator.getUpdationReturningColumns();
                            returningColumns_1.push.apply(returningColumns_1, __spreadArray([], __read(this.expressionMap.extraReturningColumns.filter(function (c) { return !returningColumns_1.includes(c); }))));
                        }
                        if (returningColumns_1.length > 0 && this.connection.driver instanceof SqlServerDriver) {
                            declareSql = this.connection.driver.buildTableVariableDeclaration("@OutputTable", returningColumns_1);
                            selectOutputSql = "SELECT * FROM @OutputTable";
                        }
                        _c = __read(this.getQueryAndParameters(), 2), updateSql = _c[0], parameters = _c[1];
                        statements = [declareSql, updateSql, selectOutputSql];
                        return [4 /*yield*/, queryRunner.query(statements.filter(function (sql) { return sql != null; }).join(";\n\n"), parameters, true)];
                    case 6:
                        queryResult = _e.sent();
                        updateResult = UpdateResult.from(queryResult);
                        if (!(this.expressionMap.updateEntity === true &&
                            this.expressionMap.mainAlias.hasMetadata &&
                            this.expressionMap.whereEntities.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, returningResultsEntityUpdator.update(updateResult, this.expressionMap.whereEntities)];
                    case 7:
                        _e.sent();
                        _e.label = 8;
                    case 8:
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 10];
                        broadcastResult = new BroadcasterResult();
                        queryRunner.broadcaster.broadcastAfterUpdateEvent(broadcastResult, this.expressionMap.mainAlias.metadata, this.expressionMap.valuesSet);
                        if (!(broadcastResult.promises.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, Promise.all(broadcastResult.promises)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10:
                        if (!transactionStartedByUs) return [3 /*break*/, 12];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 11:
                        _e.sent();
                        _e.label = 12;
                    case 12: return [2 /*return*/, updateResult];
                    case 13:
                        error_1 = _e.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 17];
                        _e.label = 14;
                    case 14:
                        _e.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 15:
                        _e.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        rollbackError_1 = _e.sent();
                        return [3 /*break*/, 17];
                    case 17: throw error_1;
                    case 18:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 20];
                        return [4 /*yield*/, queryRunner.release()];
                    case 19:
                        _e.sent();
                        _e.label = 20;
                    case 20: return [7 /*endfinally*/];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Values needs to be updated.
     */
    UpdateQueryBuilder.prototype.set = function (values) {
        this.expressionMap.valuesSet = values;
        return this;
    };
    /**
     * Sets WHERE condition in the query builder.
     * If you had previously WHERE expression defined,
     * calling this function will override previously set WHERE conditions.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.where = function (where, parameters) {
        this.expressionMap.wheres = []; // don't move this block below since computeWhereParameter can add where expressions
        var condition = this.getWhereCondition(where);
        if (condition)
            this.expressionMap.wheres = [{ type: "simple", condition: condition }];
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.andWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "and", condition: this.getWhereCondition(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new OR WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.orWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "or", condition: this.getWhereCondition(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.whereInIds = function (ids) {
        return this.where(this.getWhereInIdsCondition(ids));
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.andWhereInIds = function (ids) {
        return this.andWhere(this.getWhereInIdsCondition(ids));
    };
    /**
     * Adds new OR WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.orWhereInIds = function (ids) {
        return this.orWhere(this.getWhereInIdsCondition(ids));
    };
    /**
     * Optional returning/output clause.
     */
    UpdateQueryBuilder.prototype.output = function (output) {
        return this.returning(output);
    };
    /**
     * Optional returning/output clause.
     */
    UpdateQueryBuilder.prototype.returning = function (returning) {
        // not all databases support returning/output cause
        if (!this.connection.driver.isReturningSqlSupported())
            throw new ReturningStatementNotSupportedError();
        this.expressionMap.returning = returning;
        return this;
    };
    /**
     * Sets ORDER BY condition in the query builder.
     * If you had previously ORDER BY expression defined,
     * calling this function will override previously set ORDER BY conditions.
     */
    UpdateQueryBuilder.prototype.orderBy = function (sort, order, nulls) {
        var _a, _b;
        if (order === void 0) { order = "ASC"; }
        if (sort) {
            if (sort instanceof Object) {
                this.expressionMap.orderBys = sort;
            }
            else {
                if (nulls) {
                    this.expressionMap.orderBys = (_a = {}, _a[sort] = { order: order, nulls: nulls }, _a);
                }
                else {
                    this.expressionMap.orderBys = (_b = {}, _b[sort] = order, _b);
                }
            }
        }
        else {
            this.expressionMap.orderBys = {};
        }
        return this;
    };
    /**
     * Adds ORDER BY condition in the query builder.
     */
    UpdateQueryBuilder.prototype.addOrderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        if (nulls) {
            this.expressionMap.orderBys[sort] = { order: order, nulls: nulls };
        }
        else {
            this.expressionMap.orderBys[sort] = order;
        }
        return this;
    };
    /**
     * Sets LIMIT - maximum number of rows to be selected.
     */
    UpdateQueryBuilder.prototype.limit = function (limit) {
        this.expressionMap.limit = limit;
        return this;
    };
    /**
     * Indicates if entity must be updated after update operation.
     * This may produce extra query or use RETURNING / OUTPUT statement (depend on database).
     * Enabled by default.
     */
    UpdateQueryBuilder.prototype.whereEntity = function (entity) {
        var _this = this;
        if (!this.expressionMap.mainAlias.hasMetadata)
            throw new TypeORMError(".whereEntity method can only be used on queries which update real entity table.");
        this.expressionMap.wheres = [];
        var entities = Array.isArray(entity) ? entity : [entity];
        entities.forEach(function (entity) {
            var entityIdMap = _this.expressionMap.mainAlias.metadata.getEntityIdMap(entity);
            if (!entityIdMap)
                throw new TypeORMError("Provided entity does not have ids set, cannot perform operation.");
            _this.orWhereInIds(entityIdMap);
        });
        this.expressionMap.whereEntities = entities;
        return this;
    };
    /**
     * Indicates if entity must be updated after update operation.
     * This may produce extra query or use RETURNING / OUTPUT statement (depend on database).
     * Enabled by default.
     */
    UpdateQueryBuilder.prototype.updateEntity = function (enabled) {
        this.expressionMap.updateEntity = enabled;
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates UPDATE express used to perform insert query.
     */
    UpdateQueryBuilder.prototype.createUpdateExpression = function () {
        var _this = this;
        var valuesSet = this.getValueSet();
        var metadata = this.expressionMap.mainAlias.hasMetadata ? this.expressionMap.mainAlias.metadata : undefined;
        // prepare columns and values to be updated
        var updateColumnAndValues = [];
        var updatedColumns = [];
        if (metadata) {
            this.createPropertyPath(metadata, valuesSet).forEach(function (propertyPath) {
                // todo: make this and other query builder to work with properly with tables without metadata
                var columns = metadata.findColumnsWithPropertyPath(propertyPath);
                if (columns.length <= 0) {
                    throw new EntityColumnNotFound(propertyPath);
                }
                columns.forEach(function (column) {
                    if (!column.isUpdate) {
                        return;
                    }
                    updatedColumns.push(column);
                    //
                    var value = column.getEntityValue(valuesSet);
                    if (column.referencedColumn && value instanceof Object && !(value instanceof Buffer)) {
                        value = column.referencedColumn.getEntityValue(value);
                    }
                    else if (!(value instanceof Function)) {
                        value = _this.connection.driver.preparePersistentValue(value, column);
                    }
                    // todo: duplication zone
                    if (value instanceof Function) { // support for SQL expressions in update query
                        updateColumnAndValues.push(_this.escape(column.databaseName) + " = " + value());
                    }
                    else if (_this.connection.driver instanceof SapDriver && value === null) {
                        updateColumnAndValues.push(_this.escape(column.databaseName) + " = NULL");
                    }
                    else {
                        if (_this.connection.driver instanceof SqlServerDriver) {
                            value = _this.connection.driver.parametrizeValue(column, value);
                        }
                        var paramName = _this.createParameter(value);
                        var expression = null;
                        if ((_this.connection.driver instanceof MysqlDriver || _this.connection.driver instanceof AuroraDataApiDriver) && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            var useLegacy = _this.connection.driver.options.legacySpatialSupport;
                            var geomFromText = useLegacy ? "GeomFromText" : "ST_GeomFromText";
                            if (column.srid != null) {
                                expression = geomFromText + "(" + paramName + ", " + column.srid + ")";
                            }
                            else {
                                expression = geomFromText + "(" + paramName + ")";
                            }
                        }
                        else if (_this.connection.driver instanceof PostgresDriver && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            if (column.srid != null) {
                                expression = "ST_SetSRID(ST_GeomFromGeoJSON(" + paramName + "), " + column.srid + ")::" + column.type;
                            }
                            else {
                                expression = "ST_GeomFromGeoJSON(" + paramName + ")::" + column.type;
                            }
                        }
                        else if (_this.connection.driver instanceof SqlServerDriver && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            expression = column.type + "::STGeomFromText(" + paramName + ", " + (column.srid || "0") + ")";
                        }
                        else {
                            expression = paramName;
                        }
                        updateColumnAndValues.push(_this.escape(column.databaseName) + " = " + expression);
                    }
                });
            });
            if (metadata.versionColumn && updatedColumns.indexOf(metadata.versionColumn) === -1)
                updateColumnAndValues.push(this.escape(metadata.versionColumn.databaseName) + " = " + this.escape(metadata.versionColumn.databaseName) + " + 1");
            if (metadata.updateDateColumn && updatedColumns.indexOf(metadata.updateDateColumn) === -1)
                updateColumnAndValues.push(this.escape(metadata.updateDateColumn.databaseName) + " = CURRENT_TIMESTAMP"); // todo: fix issue with CURRENT_TIMESTAMP(6) being used, can "DEFAULT" be used?!
        }
        else {
            Object.keys(valuesSet).map(function (key) {
                var value = valuesSet[key];
                // todo: duplication zone
                if (value instanceof Function) { // support for SQL expressions in update query
                    updateColumnAndValues.push(_this.escape(key) + " = " + value());
                }
                else if (_this.connection.driver instanceof SapDriver && value === null) {
                    updateColumnAndValues.push(_this.escape(key) + " = NULL");
                }
                else {
                    // we need to store array values in a special class to make sure parameter replacement will work correctly
                    // if (value instanceof Array)
                    //     value = new ArrayParameter(value);
                    var paramName = _this.createParameter(value);
                    updateColumnAndValues.push(_this.escape(key) + " = " + paramName);
                }
            });
        }
        if (updateColumnAndValues.length <= 0) {
            throw new UpdateValuesMissingError();
        }
        // get a table name and all column database names
        var whereExpression = this.createWhereExpression();
        var returningExpression = this.createReturningExpression();
        // generate and return sql update query
        if (returningExpression && (this.connection.driver instanceof PostgresDriver || this.connection.driver instanceof OracleDriver || this.connection.driver instanceof CockroachDriver)) {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + whereExpression + " RETURNING " + returningExpression;
        }
        else if (returningExpression && this.connection.driver instanceof SqlServerDriver) {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + " OUTPUT " + returningExpression + whereExpression;
        }
        else {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + whereExpression; // todo: how do we replace aliases in where to nothing?
        }
    };
    /**
     * Creates "ORDER BY" part of SQL query.
     */
    UpdateQueryBuilder.prototype.createOrderByExpression = function () {
        var _this = this;
        var orderBys = this.expressionMap.orderBys;
        if (Object.keys(orderBys).length > 0)
            return " ORDER BY " + Object.keys(orderBys)
                .map(function (columnName) {
                if (typeof orderBys[columnName] === "string") {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName];
                }
                else {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName].order + " " + orderBys[columnName].nulls;
                }
            })
                .join(", ");
        return "";
    };
    /**
     * Creates "LIMIT" parts of SQL query.
     */
    UpdateQueryBuilder.prototype.createLimitExpression = function () {
        var limit = this.expressionMap.limit;
        if (limit) {
            if (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver) {
                return " LIMIT " + limit;
            }
            else {
                throw new LimitOnUpdateNotSupportedError();
            }
        }
        return "";
    };
    /**
     * Gets array of values need to be inserted into the target table.
     */
    UpdateQueryBuilder.prototype.getValueSet = function () {
        if (this.expressionMap.valuesSet instanceof Object)
            return this.expressionMap.valuesSet;
        throw new UpdateValuesMissingError();
    };
    return UpdateQueryBuilder;
}(QueryBuilder));
export { UpdateQueryBuilder };

//# sourceMappingURL=UpdateQueryBuilder.js.map
