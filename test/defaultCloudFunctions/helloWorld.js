await lock.self();

setProfileNode('profileData.drum', clientParams.toSet);

FunctionResponse({ okay: true });