/**
 * Friendly Mongoose
 * 
 * @description A mongoose plugin to generate friendly slugs
 * @version 1.0.0
 * @license MIT
 * 
 */

/**
 *  Add slug field to mongoose schema
 *
 * @param schema  mongoose schema
 * @param options  options
 */
function FriendlyMongoose(schema, options) {
    /**
     * Default options
     */
    const defaultOptions = {
        field: "name",
        slugField: "slug",
    };

    /**
     * Merge options
     */
    options = Object.assign({}, defaultOptions, options);

    const { field, slugField } = options;

    /**
     * Check if field exists
     */
    if (!schema.path(field)) {
        throw new Error(`Field does not exist in schema`);
    }

    /**
     * Check if slug field exists
     */
    if (!schema.path(slugField)) {
        /**
         * Add slug field to schema
         */
        const slugSchema = {
            [slugField]: {
                type: String,
                unique: true,
            },
        };
        schema.add(slugSchema);
    }

    /**
     * Add pre save hook
     */
    schema.pre("save", async function (next) {
        const self = this;
        const slug = self.get(field).replace(/\s/g, "-").toLowerCase();

        /**
         * If we are updating the document, we don't need to generate a new slug
         */
        if (!self.isNew) {
            return next();
        }

        /**
         * Check if slug already exists
         */
        const model = self.constructor;
        const slugRegex = new RegExp(`^(${slug})((-[0-9]*$)?)$`, "i");
        const docsWithSlug = await model.find({ slug: slugRegex });

        if (docsWithSlug.length) {
            self.set(slugField, `${slug}-${docsWithSlug.length + 1}`);
        } else {
            self.set(slugField, slug);
        }

        next();
    });

    /**
     * Find by slug
     *
     * @param slug
     * @returns {Query}
     */
    schema.statics.findBySlug = function (slug) {
        return this.findOne({ slug });
    };
}

module.exports = FriendlyMongoose;