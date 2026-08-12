const mongoose = require('mongoose');

/**
 * schoolScope — Mongoose Plugin for Tenant Isolation
 *
 * THIS IS THE MOST CRITICAL PIECE OF THE DATA LAYER.
 *
 * What it does:
 *   1. Adds a `school_id` field (required, indexed) to every schema it's applied to
 *   2. Hooks into all query operations to auto-inject school_id filtering
 *   3. THROWS if a query runs without school_id in context (no silent data leaks)
 *   4. Provides a `.bypassScope()` escape hatch for system-level operations
 *
 * Usage:
 *   // In model definition:
 *   schema.plugin(schoolScope);
 *
 *   // In controller/route (after auth middleware sets req.schoolId):
 *   Model.find({ grade: 10 }).setOptions({ schoolId: req.schoolId });
 *
 *   // Or use the helper added to the model:
 *   Model.scoped(req.schoolId).find({ grade: 10 });
 *
 *   // Bypass for admin/seed scripts:
 *   Model.find({ ... }).setOptions({ bypassScope: true });
 */
function schoolScope(schema, options) {
  // --- 1. Add school_id field to schema ---
  schema.add({
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'school_id is required for tenant isolation'],
      index: true,
    },
  });

  // --- 2. Query operations that need scoping ---
  const scopedQueryHooks = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'findOneAndReplace',
    'countDocuments',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'estimatedDocumentCount',
  ];

  for (const hookName of scopedQueryHooks) {
    schema.pre(hookName, function () {
      // `this` is the Query object
      const opts = this.getOptions();

      // Allow explicit bypass for system/seed operations
      if (opts.bypassScope === true) {
        return;
      }

      const schoolId = opts.schoolId;

      if (!schoolId) {
        throw new Error(
          `[TenantScope] Query "${hookName}" on "${this.model?.modelName || 'unknown'}" ` +
            'executed without school_id in context. This is a security violation. ' +
            'Use .setOptions({ schoolId }) or .bypassScope() for system queries.'
        );
      }

      // Inject school_id into the query filter
      this.where({ school_id: schoolId });
    });
  }

  // --- 3. Pre-save hook: ensure school_id is set on new documents ---
  schema.pre('save', function (next) {
    if (this.isNew && !this.school_id) {
      return next(
        new Error(
          `[TenantScope] Cannot save "${this.constructor.modelName}" without school_id.`
        )
      );
    }
    next();
  });

  // --- 4. Pre-validate on insertMany ---
  schema.pre('insertMany', function (next, docs) {
    for (let i = 0; i < docs.length; i++) {
      if (!docs[i].school_id) {
        return next(
          new Error(
            `[TenantScope] Document at index ${i} in insertMany is missing school_id.`
          )
        );
      }
    }
    next();
  });

  // --- 5. Static helper: Model.scoped(schoolId) returns a query builder ---
  schema.statics.scoped = function (schoolId) {
    if (!schoolId) {
      throw new Error(
        `[TenantScope] .scoped() called without a schoolId on "${this.modelName}".`
      );
    }

    const model = this;

    // Return a proxy-like object that sets schoolId on every query method
    return new Proxy(model, {
      get(target, prop) {
        const original = target[prop];
        if (typeof original === 'function') {
          return function (...args) {
            const result = original.apply(target, args);
            // If the result is a Mongoose Query, set the scope option
            if (result && typeof result.setOptions === 'function') {
              return result.setOptions({ schoolId });
            }
            return result;
          };
        }
        return original;
      },
    });
  };

  // --- 6. Compound index helper ---
  // Add school_id to common compound indexes for query performance
  schema.index({ school_id: 1, created_at: -1 });
}

module.exports = schoolScope;
