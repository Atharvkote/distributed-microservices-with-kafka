export interface RawCategory {
  _id: string;
  name: string;
  parent: string | null;
}

export interface Category {
  _id: string;
  name: string;
  subcategories: string[];
}

export function buildCategoryTree(categories: RawCategory[]) {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  categories.forEach(cat => {
    map[cat._id] = { ...cat, subcategories: [] };
  });

  categories.forEach(cat => {
    if (cat.parent) {
      const parent = map[cat.parent];
      if (parent) {
        parent.subcategories.push(map[cat._id]);
      }
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
}

export function formatForBento(tree: any[]): Category[] {
  return tree.map(cat => ({
    _id: cat._id,
    name: cat.name,
    subcategories: cat.subcategories?.map((sub: any) => sub.name) || []
  }));
}