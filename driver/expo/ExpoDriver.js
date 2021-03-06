"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoDriver = void 0;
var tslib_1 = require("tslib");
var AbstractSqliteDriver_1 = require("../sqlite-abstract/AbstractSqliteDriver");
var ExpoQueryRunner_1 = require("./ExpoQueryRunner");
var DriverOptionNotSetError_1 = require("../../error/DriverOptionNotSetError");
var ExpoDriver = /** @class */ (function (_super) {
    tslib_1.__extends(ExpoDriver, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function ExpoDriver(connection) {
        var _this = _super.call(this, connection) || this;
        _this.database = _this.options.database;
        // validate options to make sure everything is set
        if (!_this.options.database)
            throw new DriverOptionNotSetError_1.DriverOptionNotSetError("database");
        if (!_this.options.driver)
            throw new DriverOptionNotSetError_1.DriverOptionNotSetError("driver");
        // load sqlite package
        _this.sqlite = _this.options.driver;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Closes connection with database.
     */
    ExpoDriver.prototype.disconnect = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        try {
                            _this.queryRunner = undefined;
                            _this.databaseConnection._db.close();
                            _this.databaseConnection = undefined;
                            ok();
                        }
                        catch (error) {
                            fail(error);
                        }
                    })];
            });
        });
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    ExpoDriver.prototype.createQueryRunner = function (mode) {
        if (!this.queryRunner)
            this.queryRunner = new ExpoQueryRunner_1.ExpoQueryRunner(this);
        return this.queryRunner;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates connection with the database.
     */
    ExpoDriver.prototype.createDatabaseConnection = function () {
        var _this = this;
        return new Promise(function (ok, fail) {
            try {
                var databaseConnection_1 = _this.sqlite.openDatabase(_this.options.database);
                /*
                // we need to enable foreign keys in sqlite to make sure all foreign key related features
                // working properly. this also makes onDelete work with sqlite.
                */
                databaseConnection_1.transaction(function (tsx) {
                    tsx.executeSql("PRAGMA foreign_keys = ON;", [], function (t, result) {
                        ok(databaseConnection_1);
                    }, function (t, err) {
                        fail({ transaction: t, error: err });
                    });
                }, function (err) {
                    fail(err);
                });
            }
            catch (error) {
                fail(error);
            }
        });
    };
    return ExpoDriver;
}(AbstractSqliteDriver_1.AbstractSqliteDriver));
exports.ExpoDriver = ExpoDriver;

//# sourceMappingURL=ExpoDriver.js.map
