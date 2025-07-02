const mongoose = require("mongoose");

exports.queryCollection = async ({ model, page = 1, pageSize = 10, sort = {}, filters = {}, search = "" }) => {
  const skip = (page - 1) * pageSize;
  const match = {};

  // Apply filters
  if (filters && typeof filters === 'object') {
    for (const [field, condition] of Object.entries(filters)) {
      if (typeof condition === 'object' && condition.filter !== undefined) {
        // Basic equality filter (adjust as needed)
        match[field] = { $regex: new RegExp(condition.filter, "i") };
      }
    }
  }

  // Global search (optional)
  const searchRegex = new RegExp(search, "i");

  const searchFields = Object.entries(model.schema.paths)
    .filter(([field, type]) =>
      type.instance === "String" &&
      !["_id", "__v", "integrationId"].includes(field)
    )
    .map(([field]) => field);

  if (searchFields.length > 0) {
    match["$or"] = searchFields.map((field) => ({
      [field]: { $regex: searchRegex }
    }));
  }

  const sortField = sort?.field || '_id'; // fallback field
  const sortOrder = sort?.order === 'desc' ? -1 : 1;
  // Sorting
  const sortObj = {};
  sortObj[sortField] = sortOrder;

  const total = await model.countDocuments(match);
  const data = await model.find(match).sort(sortObj).skip(skip).limit(pageSize).lean();

  return {
    total,
    page,
    pageSize,
    data
  };
};
