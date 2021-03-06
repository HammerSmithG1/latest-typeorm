"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectTopoligicalSorter = void 0;
var tslib_1 = require("tslib");
var error_1 = require("../error");
/**
 * Orders insert or remove subjects in proper order (using topological sorting)
 * to make sure insert or remove operations are executed in a proper order.
 */
var SubjectTopoligicalSorter = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SubjectTopoligicalSorter(subjects) {
        this.subjects = tslib_1.__spreadArray([], tslib_1.__read(subjects)); // copy subjects to prevent changing of sent array
        this.metadatas = this.getUniqueMetadatas(this.subjects);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Sorts (orders) subjects in their topological order.
     */
    SubjectTopoligicalSorter.prototype.sort = function (direction) {
        var _this = this;
        // if there are no metadatas it probably mean there is no subjects... we don't have to do anything here
        if (!this.metadatas.length)
            return this.subjects;
        var sortedSubjects = [];
        // first if we sort for deletion all junction subjects
        // junction subjects are subjects without entity and database entity set
        if (direction === "delete") {
            var junctionSubjects = this.subjects.filter(function (subject) { return !subject.entity && !subject.databaseEntity; });
            sortedSubjects.push.apply(sortedSubjects, tslib_1.__spreadArray([], tslib_1.__read(junctionSubjects)));
            this.removeAlreadySorted(junctionSubjects);
        }
        // next we always insert entities with non-nullable relations, sort them first
        var nonNullableDependencies = this.getNonNullableDependencies();
        var sortedNonNullableEntityTargets = this.toposort(nonNullableDependencies);
        if (direction === "insert")
            sortedNonNullableEntityTargets = sortedNonNullableEntityTargets.reverse();
        // so we have a sorted entity targets
        // go thought each of them and find all subjects with sorted entity target
        // add those sorted targets and remove them from original array of targets
        sortedNonNullableEntityTargets.forEach(function (sortedEntityTarget) {
            var entityTargetSubjects = _this.subjects.filter(function (subject) { return subject.metadata.targetName === sortedEntityTarget; });
            sortedSubjects.push.apply(sortedSubjects, tslib_1.__spreadArray([], tslib_1.__read(entityTargetSubjects)));
            _this.removeAlreadySorted(entityTargetSubjects);
        });
        // next sort all other entities
        // same process as in above but with other entities
        var otherDependencies = this.getDependencies();
        var sortedOtherEntityTargets = this.toposort(otherDependencies);
        if (direction === "insert")
            sortedOtherEntityTargets = sortedOtherEntityTargets.reverse();
        sortedOtherEntityTargets.forEach(function (sortedEntityTarget) {
            var entityTargetSubjects = _this.subjects.filter(function (subject) { return subject.metadata.targetName === sortedEntityTarget; });
            sortedSubjects.push.apply(sortedSubjects, tslib_1.__spreadArray([], tslib_1.__read(entityTargetSubjects)));
            _this.removeAlreadySorted(entityTargetSubjects);
        });
        // if we have something left in the subjects add them as well
        sortedSubjects.push.apply(sortedSubjects, tslib_1.__spreadArray([], tslib_1.__read(this.subjects)));
        return sortedSubjects;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Removes already sorted subjects from this.subjects list of subjects.
     */
    SubjectTopoligicalSorter.prototype.removeAlreadySorted = function (subjects) {
        var _this = this;
        subjects.forEach(function (subject) {
            _this.subjects.splice(_this.subjects.indexOf(subject), 1);
        });
    };
    /**
     * Extracts all unique metadatas from the given subjects.
     */
    SubjectTopoligicalSorter.prototype.getUniqueMetadatas = function (subjects) {
        var metadatas = [];
        subjects.forEach(function (subject) {
            if (metadatas.indexOf(subject.metadata) === -1)
                metadatas.push(subject.metadata);
        });
        return metadatas;
    };
    /**
     * Gets dependency tree for all entity metadatas with non-nullable relations.
     * We need to execute insertions first for entities which non-nullable relations.
     */
    SubjectTopoligicalSorter.prototype.getNonNullableDependencies = function () {
        return this.metadatas.reduce(function (dependencies, metadata) {
            metadata.relationsWithJoinColumns.forEach(function (relation) {
                if (relation.isNullable)
                    return;
                dependencies.push([metadata.targetName, relation.inverseEntityMetadata.targetName]);
            });
            return dependencies;
        }, []);
    };
    /**
     * Gets dependency tree for all entity metadatas with non-nullable relations.
     * We need to execute insertions first for entities which non-nullable relations.
     */
    SubjectTopoligicalSorter.prototype.getDependencies = function () {
        return this.metadatas.reduce(function (dependencies, metadata) {
            metadata.relationsWithJoinColumns.forEach(function (relation) {
                // if relation is self-referenced we skip it
                if (relation.inverseEntityMetadata === metadata)
                    return;
                dependencies.push([metadata.targetName, relation.inverseEntityMetadata.targetName]);
            });
            return dependencies;
        }, []);
    };
    /**
     * Sorts given graph using topological sorting algorithm.
     *
     * Algorithm is kindly taken from https://github.com/marcelklehr/toposort repository.
     */
    SubjectTopoligicalSorter.prototype.toposort = function (edges) {
        function uniqueNodes(arr) {
            var res = [];
            for (var i_1 = 0, len = arr.length; i_1 < len; i_1++) {
                var edge = arr[i_1];
                if (res.indexOf(edge[0]) < 0)
                    res.push(edge[0]);
                if (res.indexOf(edge[1]) < 0)
                    res.push(edge[1]);
            }
            return res;
        }
        var nodes = uniqueNodes(edges);
        var cursor = nodes.length, sorted = new Array(cursor), visited = {}, i = cursor;
        while (i--) {
            if (!visited[i])
                visit(nodes[i], i, []);
        }
        function visit(node, i, predecessors) {
            if (predecessors.indexOf(node) >= 0) {
                throw new error_1.TypeORMError("Cyclic dependency: " + JSON.stringify(node)); // todo: better error
            }
            if (!~nodes.indexOf(node)) {
                throw new error_1.TypeORMError("Found unknown node. Make sure to provided all involved nodes. Unknown node: " + JSON.stringify(node));
            }
            if (visited[i])
                return;
            visited[i] = true;
            // outgoing edges
            var outgoing = edges.filter(function (edge) {
                return edge[0] === node;
            });
            if (i = outgoing.length) {
                var preds = predecessors.concat(node);
                do {
                    var child = outgoing[--i][1];
                    visit(child, nodes.indexOf(child), preds);
                } while (i);
            }
            sorted[--cursor] = node;
        }
        return sorted;
    };
    return SubjectTopoligicalSorter;
}());
exports.SubjectTopoligicalSorter = SubjectTopoligicalSorter;

//# sourceMappingURL=SubjectTopoligicalSorter.js.map
