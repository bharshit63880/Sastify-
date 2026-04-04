export const getCategoryHref = (category) => `/category/${category?.path || category?.slug || ""}`;

export const buildCategoryTree = (categories = []) => {
  const nodesById = new Map();
  const roots = [];

  categories.forEach((category) => {
    nodesById.set(String(category._id), {
      ...category,
      children: [],
    });
  });

  nodesById.forEach((category) => {
    if (category.parentId) {
      const parent = nodesById.get(String(category.parentId));
      if (parent) {
        parent.children.push(category);
        return;
      }
    }

    roots.push(category);
  });

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);

  return { roots, nodesById };
};

export const getCategoryNode = (category, nodesById) => {
  if (typeof category === "string" || typeof category === "number") {
    return nodesById.get(String(category)) || null;
  }

  if (!category?._id) return null;
  return nodesById.get(String(category._id)) || null;
};

export const getCategoryAncestors = (category, nodesById) => {
  const node = getCategoryNode(category, nodesById);
  const ancestors = [];
  let current = node;

  while (current?.parentId) {
    const parent = nodesById.get(String(current.parentId));
    if (!parent) break;

    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
};

export const getCategoryDescendants = (category, nodesById) => {
  const node = getCategoryNode(category, nodesById);
  if (!node) return [];

  const descendants = [];

  const walk = (current) => {
    current.children.forEach((child) => {
      descendants.push(child);
      walk(child);
    });
  };

  walk(node);

  return descendants;
};

export const getLeafCategories = (category, nodesById) => {
  const node = getCategoryNode(category, nodesById);
  if (!node) return [];
  if (!node.children.length) return [node];

  return getCategoryDescendants(node, nodesById).filter((item) => !item.children.length);
};

export const getRootCategory = (category, nodesById) => {
  const node = getCategoryNode(category, nodesById);
  if (!node) return null;

  let current = node;

  while (current?.parentId) {
    const parent = nodesById.get(String(current.parentId));
    if (!parent) break;
    current = parent;
  }

  return current;
};

export const resolveCategoryFromSegments = (categories, segments = []) => {
  const [slug, parent, child, grandchild] = segments;
  const resolvedPath = [parent, child, grandchild].filter(Boolean).join("/");

  return (
    categories.find((item) => item.path === resolvedPath) ||
    categories.find((item) => item.slug === grandchild) ||
    categories.find((item) => item.slug === child) ||
    categories.find((item) => item.slug === slug) ||
    null
  );
};
