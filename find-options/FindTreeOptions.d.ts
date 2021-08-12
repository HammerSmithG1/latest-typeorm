/**
 * Defines a special criteria to find specific entities.
 */
export interface FindTreeOptions {
    /**
      * Indicates what relations of entity should be loaded (simplified left join form).
     */
    relations?: string[];
}
