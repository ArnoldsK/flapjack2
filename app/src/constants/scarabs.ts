// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ScarabMapping {
  export interface Group {
    scarabs: string[];
  }

  export interface Row {
    groups: Group[];
  }

  export interface Column {
    gap: number;
    marginRight: number;
    isVerticallyCentered: boolean;
    rows: Row[];
  }

  export interface Root {
    cols: Column[];
  }
}

export const mapping: ScarabMapping.Root = {
  cols: [
    {
      gap: 14,
      marginRight: 55,
      isVerticallyCentered: false,
      rows: [
        {
          groups: [
            {
              scarabs: [
                "Cartography Scarab of Escalation",
                "Cartography Scarab of Risk",
                "Cartography Scarab of the Multitude",
                "Cartography Scarab of Corruption",
                "Cartography Scarab of Singularity",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Divination Scarab of The Cloister",
                "Divination Scarab of Plenty",
                "Divination Scarab of Pilfering",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Bestiary Scarab",
                "Bestiary Scarab of the Herd",
                "Bestiary Scarab of Duplicating",
                "Bestiary Scarab of the Shadowed Crow",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Betrayal Scarab",
                "Betrayal Scarab of the Allflame",
                "Betrayal Scarab of Reinforcements",
                "Betrayal Scarab of Unbreaking",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Incursion Scarab",
                "Incursion Scarab of Invasion",
                "Incursion Scarab of Champions",
                "Incursion Scarab of Timelines",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Sulphite Scarab",
                "Sulphite Scarab of Fumes",
                "Sulphite Scarab of Greed",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Ambush Scarab",
                "Ambush Scarab of Hidden Compartments",
                "Ambush Scarab of Potency",
                "Ambush Scarab of Containment",
                "Ambush Scarab of Discernment",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Anarchy Scarab",
                "Anarchy Scarab of Gigantification",
                "Anarchy Scarab of Partnership",
                "Anarchy Scarab of the Exceptional",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Beyond Scarab",
                "Beyond Scarab of Haemophilia",
                "Beyond Scarab of Resurgence",
                "Beyond Scarab of the Invasion",
                "Beyond Scarab of Corruption",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Domination Scarab",
                "Domination Scarab of Apparitions",
                "Domination Scarab of Evolution",
                "Domination Scarab of Terrors",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Essence Scarab",
                "Essence Scarab of Ascent",
                "Essence Scarab of Stability",
                "Essence Scarab of Calcification",
                "Essence Scarab of Adaptation",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Torment Scarab",
                "Torment Scarab of Peculiarity",
                "Torment Scarab of Possession",
                "Torment Scarab of Release",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 14,
      marginRight: 0,
      isVerticallyCentered: false,
      rows: [
        {
          groups: [
            {
              scarabs: [
                "Influencing Scarab of the Shaper",
                "Influencing Scarab of the Elder",
                "Influencing Scarab of Hordes",
                "Influencing Scarab of Interference",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Titanic Scarab",
                "Titanic Scarab of Treasures",
                "Titanic Scarab of Legend",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Abyss Scarab",
                "Abyss Scarab of Multitudes",
                "Abyss Scarab of Edifice",
                "Abyss Scarab of Descending",
                "Abyss Scarab of Profound Depth",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Blight Scarab",
                "Blight Scarab of the Blightheart",
                "Blight Scarab of Blooming",
                "Blight Scarab of Invigoration",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Breach Scarab of the Hive",
                "Breach Scarab of Instability",
                "Breach Scarab of the Marshal",
                "Breach Scarab of the Incensed Swarm",
                "Breach Scarab of Resonant Cascade",
                "Breach Scarab of the Dreamer",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Delirium Scarab",
                "Delirium Scarab of Mania",
                "Delirium Scarab of Paranoia",
                "Delirium Scarab of Neuroses",
                "Delirium Scarab of Delusions",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Expedition Scarab",
                "Expedition Scarab of Runefinding",
                "Expedition Scarab of Verisium Powder",
                "Expedition Scarab of Infusion",
                "Expedition Scarab of Archaeology",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Harvest Scarab",
                "Harvest Scarab of Doubling",
                "Harvest Scarab of Cornucopia",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Kalguuran Scarab",
                "Kalguuran Scarab of Guarded Riches",
                "Kalguuran Scarab of Refinement",
                "Kalguuran Scarab of Enriching",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Legion Scarab",
                "Legion Scarab of Officers",
                "Legion Scarab of Treasures",
                "Legion Scarab of Eternal Conflict",
                "Legion Scarab of The Sekhema",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Ritual Scarab of Selectiveness",
                "Ritual Scarab of Wisps",
                "Ritual Scarab of Abundance",
                "Ritual Scarab of Corpses",
              ],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: [
                "Ultimatum Scarab",
                "Ultimatum Scarab of Bribing",
                "Ultimatum Scarab of Dueling",
                "Ultimatum Scarab of Catalysing",
                "Ultimatum Scarab of Inscription",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 5,
      marginRight: 10,
      isVerticallyCentered: true,
      rows: [
        {
          groups: [
            {
              scarabs: ["Scarab of Monstrous Lineage"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of Adversaries"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of Divinity"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of the Dextral"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of the Sinistral"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of Wisps"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of Radiant Storms"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Scarab of Stability"],
            },
          ],
        },
      ],
    },
    {
      gap: 5,
      marginRight: 0,
      isVerticallyCentered: true,
      rows: [
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Bloodlines"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Nemeses"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Preservation"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Awakening"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Tradition"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Glittering"],
            },
          ],
        },
        {
          groups: [
            {
              scarabs: ["Horned Scarab of Pandemonium"],
            },
          ],
        },
      ],
    },
  ],
};
