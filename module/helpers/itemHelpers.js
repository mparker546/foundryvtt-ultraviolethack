import * as c from "../constants.js";

/**
 * Update encumbrance when actor items change
 * @param {Object} actor
 */
export const updateActorEncumbrance = async (actor) => {
  const items = actor.items;
  // Calculate encumbrance
  let encEquipped = 0;
  let encStored = 0;
  const equippedarmor = items.filter((item) => item.type === c.armor && item.data.data.equippedStatus === c.EQUIPPED);
  encEquipped = encEquipped + getEncumbranceForItems(equippedarmor);
  encEquipped =
    encEquipped +
    getEncumbranceForItems(
      items.filter((item) => item.type === c.WEAPON && item.data.data.equippedStatus === c.EQUIPPED)
    );
  encEquipped =
    encEquipped +
    getEncumbranceForItems(
      items.filter((item) => item.type === c.GEAR && item.data.data.equippedStatus === c.EQUIPPED)
    );
  encStored =
    encStored +
    getEncumbranceForItems(
      items.filter((item) => item.type === c.armor && item.data.data.equippedStatus === c.STORED)
    );
  encStored =
    encStored +
    getEncumbranceForItems(
      items.filter((item) => item.type === c.WEAPON && item.data.data.equippedStatus === c.STORED)
    );
  encStored =
    encStored +
    getEncumbranceForItems(items.filter((item) => item.type === c.GEAR && item.data.data.equippedStatus === c.STORED));

  await actor.update({
    data: {
      encumbrance: {
        equipped: encEquipped,
        stored: encStored,
      },
    },
  });
};

/**
 * Update AC when actor items change
 * @param {Object} actor
 */
export const updateActorarmorClass = async (actor) => {
  const items = actor.items;
  const equippedarmor = items.filter((item) => item.type === c.armor && item.data.data.equippedStatus === c.EQUIPPED);

  // Calculate armor class
  let ac = 0;
  if (equippedarmor.length > 0) {
    ac = getarmorClassForItems(equippedarmor);
  }

  await actor.update({
    data: {
      combat: {
        armorClass: ac,
      },
    },
  });
};

/**
 * Update Vocation and Species for actor when actor items change
 * @param {Object} actor
 */
export const updateActorGroups = async (actor) => {
  const items = actor.items;

  // Get vocation and species
  const speciesObj = items.filter((item) => item.type === c.ABILITY && item.data.data.type === c.SPECIES);
  const vocationObj = items.filter((item) => item.type === c.ABILITY && item.data.data.type === c.VOCATION);
  const species = speciesObj.length > 0 ? speciesObj[0].name : game.settings.get("ultraviolethack", "defaultSpecies");
  const vocation = vocationObj.length > 0 ? vocationObj[0].name : c.EMPTYSTRING;

  await actor.update({
    data: {
      basics: {
        vocation: vocation,
        species: species,
      },
    },
  });
};

const getarmorClassForItems = (items) => {
  let maxAc = 0;
  let shieldHelmAc = 0;
  items.forEach((item) => {
    let tempAc = item.data.data.armorClass;
    if (tempAc === c.PLUSONE) {
      shieldHelmAc = 1;
    } else if (tempAc !== c.SPECIAL) {
      tempAc = +tempAc;
      maxAc = tempAc > maxAc ? tempAc : maxAc;
    }
  });
  return maxAc + shieldHelmAc;
};

const getEncumbranceForItems = (items) => {
  let encCount = 0;
  items.forEach((item) => {
    if (item.type == c.WEAPON || item.type === c.GEAR) {
      const quantity = item.data.data.quantity === undefined ? 1 : item.data.data.quantity;
      switch (item.data.data.weight) {
        case c.REGULAR:
          encCount = encCount + quantity;
          break;
        case c.HEAVY:
          encCount = encCount + quantity * 2;
          break;
        case c.MINOR:
          encCount = encCount + quantity / 2;
          break;
        case c.SMALL:
          encCount = encCount + quantity / 5;
          break;
        case c.NEGLIGIBLE:
          encCount = encCount + quantity / 100;
          break;
        default:
          encCount = encCount++;
      }
    } else {
      if (item.data.data.armorClass !== c.SPECIAL && item.data.data.armorClass !== c.PLUSONE) {
        encCount = encCount + +item.data.data.armorClass;
      } else {
        encCount = encCount + 1;
      }
    }
  });
  return encCount;
};
