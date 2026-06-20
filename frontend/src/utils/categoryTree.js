


export function flattenCategories( categories, level = 0) {
  const result = [];

  categories.forEach((category) => {
    result.push({ ...category, level,});

    if ( category.children && category.children.length > 0) {        
      result.push( ...flattenCategories( category.children, level + 1 )
      );
    }
  });

  return result;
}