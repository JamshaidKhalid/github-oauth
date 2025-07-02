const mongoose = require("mongoose");

exports.queryCollection = async ({ model, page = 1, pageSize = 10, sort = {}, filters = {}, search = "" }) => {
  const skip = (page - 1) * pageSize;
  const match = {};

  // Apply filters
  for (const key in filters) {
    match[key] = { $regex: filters[key], $options: "i" }; // case-insensitive
  }

  // Global search (optional)
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search, "i");
    const searchFields = Object.keys(model.schema.paths).filter(
      (field) => !["_id", "__v", "integrationId"].includes(field)
    );

    match["$or"] = searchFields.map((field) => ({
      [field]: { $regex: searchRegex }
    }));
  }

  // Sorting
  const sortObj = {};
  if (sort.field) {
    sortObj[sort.field] = sort.order === "desc" ? -1 : 1;
  }

  const total = await model.countDocuments(match);
  const data = await model.find(match).sort(sortObj).skip(skip).limit(pageSize).lean();

  return {
    total,
    page,
    pageSize,
    data
  };
};
