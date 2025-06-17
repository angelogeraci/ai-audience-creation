/**
 * Check if two interests are duplicates
 * @param {Object} interest1 - First interest
 * @param {Object} interest2 - Second interest
 * @returns {boolean} - true if the interests are considered duplicates
 */
function areDuplicateInterests(interest1, interest2) {
  // Check if IDs are identical
  if (interest1.id === interest2.id) {
    return true;
  }
  
  // Check if names are very similar
  const name1 = interest1.matched.toLowerCase();
  const name2 = interest2.matched.toLowerCase();
  
  // Substring (one name contains the other)
  if (name1.includes(name2) || name2.includes(name1)) {
    return true;
  }
  
  return false;
}

/**
 * Remove duplicates between different interest groups
 * @param {Array} groups - Validated interest groups
 * @returns {Array} - Groups without duplicates
 */
function removeDuplicates(groups) {
  if (!groups || groups.length <= 1) {
    return groups;
  }
  
  const processedGroups = [];
  const allInterests = [];
  
  for (const group of groups) {
    const uniqueInterests = [];
    
    for (const interest of group.interests) {
      // Check if this interest is a duplicate of something we've already seen
      const isDuplicate = allInterests.some(existingInterest => 
        areDuplicateInterests(interest, existingInterest)
      );
      
      if (!isDuplicate) {
        uniqueInterests.push(interest);
        allInterests.push(interest);
      }
    }
    
    // Add the group only if it is not empty after removing duplicates
    if (uniqueInterests.length > 0) {
      processedGroups.push({
        name: group.name,
        interests: uniqueInterests
      });
    }
  }
  
  return processedGroups;
}

/**
 * Generate the final audience text for Meta Campaign Manager
 * @param {Object} validatedCriteria - Validated criteria structure
 * @returns {Object} - Audience formatted for Meta
 */
function buildFinalAudience(validatedCriteria) {
  // Nouvelle structure : validatedCriteria.themes
  const allInterests = [];
  const textRepresentation = [
    'INCLUDE people who match ALL of the following criteria:',
    '',
    // Add fields if present
    validatedCriteria.fields ? `Gender: ${validatedCriteria.fields.gender || 'Not specified'} | Geolocation: ${validatedCriteria.fields.geolocation || 'Not specified'} | Age: ${validatedCriteria.fields.age || 'Not specified'}` : '',
    ''
  ];
  const apiThemes = [];

  if (!validatedCriteria.themes || !Array.isArray(validatedCriteria.themes)) {
    return {
      text: 'No valid audience found.',
      structure: { themes: [] }
    };
  }

  validatedCriteria.themes.forEach((theme, tIdx) => {
    textRepresentation.push(`${theme.name} :`);
    const apiTheme = { name: theme.name };
    // For each interest subsection (except 'name')
    Object.entries(theme).forEach(([section, interests]) => {
      if (section === 'name' || !Array.isArray(interests)) return;
      // Filter by similarity >= 0.75 (ratio)
      const filteredInterests = interests.filter(interest => interest.score >= 0.75);
      // Remove duplicates from all interests
      const uniqueInterests = filteredInterests.filter(interest => {
        const isDuplicate = allInterests.some(existing =>
          existing.id === interest.id ||
          (existing.matched && interest.matched && (
            existing.matched.toLowerCase() === interest.matched.toLowerCase() ||
            existing.matched.toLowerCase().includes(interest.matched.toLowerCase()) ||
            interest.matched.toLowerCase().includes(existing.matched.toLowerCase())
          ))
        );
        if (!isDuplicate) allInterests.push(interest);
        return !isDuplicate;
      });
      if (uniqueInterests.length > 0) {
        // Add to text display
        textRepresentation.push(`  - ${section} : ${uniqueInterests.map(i => `"${i.matched}"`).join(' OR ')}`);
        // Add to API structure
        apiTheme[section] = uniqueInterests.map(i => ({ id: i.id, name: i.matched }));
      }
    });
    textRepresentation.push('');
    apiThemes.push(apiTheme);
  });

  return {
    text: textRepresentation.join('\n'),
    structure: { fields: validatedCriteria.fields || {}, themes: apiThemes }
  };
}

module.exports = {
  removeDuplicates,
  buildFinalAudience
};