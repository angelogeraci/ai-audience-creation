/**
 * Vérifie si deux intérêts sont des doublons
 * @param {Object} interest1 - Premier intérêt
 * @param {Object} interest2 - Second intérêt
 * @returns {boolean} - true si les intérêts sont considérés comme doublons
 */
function areDuplicateInterests(interest1, interest2) {
  // Vérifier si les IDs sont identiques
  if (interest1.id === interest2.id) {
    return true;
  }
  
  // Vérifier si les noms sont très similaires
  const name1 = interest1.matched.toLowerCase();
  const name2 = interest2.matched.toLowerCase();
  
  // Correspondance exacte des noms
  if (name1 === name2) {
    return true;
  }
  
  // Sous-chaîne (un nom contient l'autre)
  if (name1.includes(name2) || name2.includes(name1)) {
    return true;
  }
  
  return false;
}

/**
 * Supprime les doublons entre les différents groupes d'intérêts
 * @param {Array} groups - Groupes d'intérêts validés
 * @returns {Array} - Groupes sans doublons
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
      // Vérifier si cet intérêt est un doublon de quelque chose qu'on a déjà vu
      const isDuplicate = allInterests.some(existingInterest => 
        areDuplicateInterests(interest, existingInterest)
      );
      
      if (!isDuplicate) {
        uniqueInterests.push(interest);
        allInterests.push(interest);
      }
    }
    
    // Ajouter le groupe uniquement s'il n'est pas vide après suppression des doublons
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
 * Génère le texte final de l'audience pour Meta Campaign Manager
 * @param {Object} validatedCriteria - Structure de critères validés
 * @returns {Object} - Audience formatée pour Meta
 */
function buildFinalAudience(validatedCriteria) {
  // Supprimer les doublons entre les groupes
  const uniqueGroups = removeDuplicates(validatedCriteria.groups);
  
  // Générer la représentation textuelle
  const textRepresentation = [
    'INCLURE les personnes qui correspondent à TOUS les critères suivants:',
    ''
  ];
  
  uniqueGroups.forEach((group, index) => {
    textRepresentation.push(`Groupe ${index + 1} (${group.name.replace(/Groupe \d+ \((.+)\)/, '$1')}):`);  
    
    const interestTerms = group.interests.map(i => `"${i.matched}"`);
    textRepresentation.push(`  - Intérêt pour: ${interestTerms.join(' OR ')}`)
    textRepresentation.push('');
  });
  
  // Générer la représentation structurée pour l'API
  const apiRepresentation = {
    groups: uniqueGroups.map(group => ({
      name: group.name,
      interests: group.interests.map(interest => ({
        id: interest.id,
        name: interest.matched
      }))
    }))
  };
  
  return {
    text: textRepresentation.join('\n'),
    structure: apiRepresentation
  };
}

module.exports = {
  removeDuplicates,
  buildFinalAudience
};